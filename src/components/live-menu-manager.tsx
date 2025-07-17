
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Pencil, XCircle, Upload, Sparkles, QrCode, Printer } from "lucide-react";
import { menuData, MenuItem } from '@/lib/menu-data';
import { useToast } from '@/hooks/use-toast';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import QRCode from 'qrcode.react';
import { getRestaurants } from '@/lib/restaurants-data';
import { Badge } from "@/components/ui/badge";

interface LiveMenuManagerProps {
    restaurantId: string;
}

const MENU_STORAGE_KEY_PREFIX = 'menuData-';

const initialFormState: Omit<MenuItem, 'id' | 'createdAt'> = {
    name: '',
    description: '',
    price: '',
    image: '',
    category: '' as MenuItem['category'],
    department: '' as MenuItem['department'],
    printGroup: '', // New field
    tags: [],
    isVisible: true,
};

export function LiveMenuManager({ restaurantId }: LiveMenuManagerProps) {
    const { toast } = useToast();
    const storageKey = `${MENU_STORAGE_KEY_PREFIX}${restaurantId}`;
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [formState, setFormState] = useState(initialFormState);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [menuUrl, setMenuUrl] = useState('');
    const [restaurantName, setRestaurantName] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = `${window.location.origin}/restaurants/${restaurantId}/menu`;
            setMenuUrl(url);

            const restaurant = getRestaurants().find(r => r.id === restaurantId);
            if (restaurant) {
                setRestaurantName(restaurant.name);
            }
        }
    }, [restaurantId]);


    useEffect(() => {
        const storedMenuRaw = localStorage.getItem(storageKey);
        let menuToLoad: MenuItem[] = menuData[restaurantId] || [];

        if (storedMenuRaw) {
            try {
                const storedMenu: MenuItem[] = JSON.parse(storedMenuRaw);
                const cleanedMenu = storedMenu.map(item => ({
                    ...item,
                    isVisible: item.isVisible !== false,
                    department: item.department || (item.category === 'Bebidas' ? 'Copa' : 'Cozinha'),
                    printGroup: item.printGroup || item.department || (item.category === 'Bebidas' ? 'Copa' : 'Cozinha'), // Fallback for old items
                    createdAt: item.createdAt || new Date().toISOString()
                }));
                menuToLoad = cleanedMenu;
            } catch (e) {
                console.error("Failed to parse menu from localStorage, falling back to default.", e);
                menuToLoad = menuData[restaurantId] || [];
            }
        }
        
        setMenuItems(menuToLoad);
        setIsLoaded(true);
    }, [restaurantId, storageKey]);

    const saveMenu = (updatedMenu: MenuItem[], successMessage?: string) => {
        setMenuItems(updatedMenu);
        localStorage.setItem(storageKey, JSON.stringify(updatedMenu));
        window.dispatchEvent(new Event('menuChanged'));
        if (successMessage) {
            toast({
                title: "Sucesso!",
                description: successMessage,
            });
        }
    };

    const handleToggleVisibility = (id: string, isVisible: boolean) => {
        const updatedMenu = menuItems.map(item =>
            item.id === id ? { ...item, isVisible } : item
        );
        saveMenu(updatedMenu);
        toast({
            title: `Item ${isVisible ? 'visível' : 'oculto'}`,
            description: `O item agora está ${isVisible ? 'visível' : 'oculto'} no cardápio público.`,
        });
    };
    
    const handleFormInputChange = (field: keyof Omit<typeof formState, 'image' | 'category' | 'tags' | 'isVisible' | 'department' | 'printGroup'>, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handlePrintGroupChange = (value: string) => {
        setFormState(prev => ({ ...prev, printGroup: value }));
    };
    
    const handleSelectChange = (field: 'category' | 'department', value: string) => {
        setFormState(prev => {
            const newState = { ...prev, [field]: value as any };
            // If printGroup is empty or matches the old department, update it to match the new department.
            if (!newState.printGroup || newState.printGroup === prev.department) {
                newState.printGroup = value;
            }
            return newState;
        });
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormState(prev => ({ ...prev, image: base64String }));
                setPreviewImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormState(initialFormState);
        setEditingItemId(null);
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleAddItem = () => {
        if (!formState.name || !formState.price || !formState.category || !formState.department || !formState.printGroup) {
            toast({
                title: "Campos Obrigatórios",
                description: "Por favor, preencha nome, preço, categoria, departamento e grupo de impressão.",
                variant: "destructive",
            });
            return;
        }

        const newMenuItem: MenuItem = {
            ...formState,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            isVisible: true,
        };
        
        const updatedMenu = [...menuItems, newMenuItem];
        saveMenu(updatedMenu, "Novo item adicionado com sucesso.");
        resetForm();
    };

    const handleUpdateItem = () => {
        if (!editingItemId) return;
        
        const updatedMenu = menuItems.map(item => 
            item.id === editingItemId ? { ...item, ...formState, id: item.id } : item
        );
        
        saveMenu(updatedMenu, "Item atualizado com sucesso.");
        resetForm();
    };
    
    const handleDeleteItem = (id: string) => {
        const updatedMenu = menuItems.filter(item => item.id !== id);
        saveMenu(updatedMenu, "Item excluído com sucesso.");
    };

    const handleEditClick = (item: MenuItem) => {
        setEditingItemId(item.id);
        setFormState({
            ...initialFormState,
            ...item
        });
        setPreviewImage(item.image);
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const handleSubmit = () => {
        if (editingItemId) {
            handleUpdateItem();
        } else {
            handleAddItem();
        }
    };

    const handlePrintQrCode = () => {
        const qrCodeDataUrl = (document.getElementById('qrcode-canvas') as HTMLCanvasElement)?.toDataURL('image/png');
        if (qrCodeDataUrl) {
            const printWindow = window.open('', '_blank');
            printWindow?.document.write(`
                <html>
                    <head>
                        <title>QR Code Cardápio - ${restaurantName}</title>
                        <style>
                            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; }
                            img { max-width: 80%; }
                            @media print {
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <h2>${restaurantName}</h2>
                        <p>Aponte sua câmera para acessar nosso cardápio</p>
                        <img src="${qrCodeDataUrl}" alt="QR Code Cardápio"/>
                        <br/>
                        <button class="no-print" onclick="window.print()">Imprimir</button>
                    </body>
                </html>
            `);
            printWindow?.document.close();
        }
    }


    if (!isLoaded) {
        return <p>Carregando gerenciador de cardápio...</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl font-bold">
                    LiveMenu - Gerenciador de Cardápio
                </CardTitle>
                <CardDescription>
                    Adicione e edite os itens do seu cardápio, definindo o departamento e o grupo de impressão para cada um.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* QR Code Section */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><QrCode /> Acesso via QR Code</CardTitle>
                                <CardDescription>Coloque nas mesas para acesso rápido ao cardápio.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                {menuUrl && (
                                    <div className="p-4 border rounded-lg bg-white">
                                        <QRCode id="qrcode-canvas" value={menuUrl} size={180} />
                                    </div>
                                )}
                                <Button onClick={handlePrintQrCode} className="w-full">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimir QR Code
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                     {/* Form Section */}
                    <div className="lg:col-span-2">
                        <div className="p-4 border rounded-lg space-y-4">
                            <h4 className="font-semibold text-lg">{editingItemId ? 'Editando Item' : 'Adicionar Novo Item'}</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    placeholder="Nome do Prato"
                                    value={formState.name}
                                    onChange={(e) => handleFormInputChange('name', e.target.value)}
                                />
                                 <Input
                                    placeholder="Preço (Ex: R$ 50,00)"
                                    value={formState.price}
                                    onChange={(e) => handleFormInputChange('price', e.target.value)}
                                />
                                <Select onValueChange={(value) => handleSelectChange('category', value)} value={formState.category}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a Categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Entradas">Entradas</SelectItem>
                                        <SelectItem value="Pratos Principais">Pratos Principais</SelectItem>
                                        <SelectItem value="Sobremesas">Sobremesas</SelectItem>
                                        <SelectItem value="Bebidas">Bebidas</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={(value) => handleSelectChange('department', value)} value={formState.department}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Departamento de Produção" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cozinha">Cozinha</SelectItem>
                                        <SelectItem value="Copa">Copa / Bar</SelectItem>
                                    </SelectContent>
                                </Select>
                                 <div className="md:col-span-2">
                                     <Label>Grupo de Impressão</Label>
                                    <Input
                                        placeholder="Ex: Chapa, Fritadeira, Saladas, Drinks"
                                        value={formState.printGroup}
                                        onChange={(e) => handlePrintGroupChange(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Nome da impressora/estação que produzirá este item.</p>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="mr-2 h-4 w-4"/>
                                        Imagem
                                    </Button>
                                    <Input
                                        id="image-upload"
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    {previewImage && (
                                        <img src={previewImage} alt="Pré-visualização" className="h-10 w-10 rounded-md object-cover" />
                                    )}
                                </div>
                                <Textarea
                                    placeholder="Descrição / Observações"
                                    className="md:col-span-2"
                                    value={formState.description}
                                    onChange={(e) => handleFormInputChange('description', e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Button onClick={handleSubmit}>
                                    {editingItemId ? 'Salvar Alterações' : <> <PlusCircle className="mr-2 h-4 w-4" /> Adicionar </>}
                                </Button>
                                {editingItemId && (
                                    <Button variant="outline" onClick={handleCancelEdit}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="font-semibold text-lg mb-4">Itens Atuais do Cardápio</h4>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Imagem</TableHead>
                                    <TableHead>Prato</TableHead>
                                    <TableHead>Departamento</TableHead>
                                    <TableHead>Grupo Impressão</TableHead>
                                    <TableHead>Preço</TableHead>
                                    <TableHead>Visibilidade</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {menuItems.map((item) => (
                                    <TableRow key={item.id} className={cn(!item.isVisible && "opacity-50")}>
                                        <TableCell>
                                            <img src={item.image || "https://placehold.co/48x48.png"} alt={item.name} width={48} height={48} className="rounded-md object-cover aspect-square" data-ai-hint="food dish" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{item.department}</Badge></TableCell>
                                        <TableCell><Badge variant="secondary">{item.printGroup}</Badge></TableCell>
                                        <TableCell>{item.price}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`visibility-switch-${item.id}`}
                                                    checked={item.isVisible}
                                                    onCheckedChange={(checked) => handleToggleVisibility(item.id, checked)}
                                                    aria-label={item.isVisible ? "Ocultar item" : "Mostrar item"}
                                                />
                                                <Label htmlFor={`visibility-switch-${item.id}`} className="sr-only">
                                                    {item.isVisible ? "Visível" : "Oculto"}
                                                </Label>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                                                <Pencil className="h-4 w-4 text-primary" />
                                                <span className="sr-only">Editar item</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Excluir item</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {menuItems.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                                            Seu cardápio está vazio. Adicione um item acima.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

    