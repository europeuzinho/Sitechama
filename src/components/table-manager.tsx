

"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Restaurant, Table as TableData, updateRestaurant } from "@/lib/restaurants-data";
import { Table as TableIcon, PlusCircle, Pencil, Trash2, Link2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { TableForm } from "./table-form";
import { Badge } from "./ui/badge";

interface TableManagerProps {
  restaurant: Restaurant;
  onTablesUpdate: (updatedRestaurant: Restaurant) => void;
}

export function TableManager({ restaurant, onTablesUpdate }: TableManagerProps) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [currentTables, setCurrentTables] = useState<TableData[]>([]);
  
  const loadData = () => {
    setCurrentTables(restaurant.tables || []);
  };
  
  useEffect(() => {
    loadData();
    window.addEventListener('restaurantsChanged', loadData);
    return () => {
        window.removeEventListener('restaurantsChanged', loadData);
    }
  }, [restaurant]);


  const handleFormSubmit = (values: Omit<TableData, 'id'> | TableData) => {
    let updatedTables: TableData[];
    
    if ('id' in values && values.id) { // Editing existing table
      updatedTables = currentTables.map(t => (t.id === values.id ? { ...t, ...values } : t));
      toast({ title: "Mesa Atualizada", description: `A mesa ${values.number} foi atualizada com sucesso.` });
    } else { // Adding new table
      const newTable: TableData = { ...values, id: Date.now().toString(), combinableWith: values.combinableWith || [] };
      updatedTables = [...currentTables, newTable];
      toast({ title: "Mesa Adicionada", description: `A mesa ${values.number} foi adicionada.` });
    }
    
    const updatedRestaurant = { ...restaurant, tables: updatedTables };
    updateRestaurant(updatedRestaurant);
    onTablesUpdate(updatedRestaurant); // Notify parent component
    setCurrentTables(updatedTables); // Update local state

    setIsFormOpen(false);
    setEditingTable(null);
  };
  
  const handleDelete = (tableId: string) => {
    const tables = restaurant.tables || [];
    const updatedTables = tables
        .filter(t => t.id !== tableId)
        .map(t => ({
            ...t,
            combinableWith: t.combinableWith?.filter(id => id !== tableId) || []
        }));

    const updatedRestaurant = { ...restaurant, tables: updatedTables };
    updateRestaurant(updatedRestaurant);
    onTablesUpdate(updatedRestaurant);
    setCurrentTables(updatedTables);
    toast({ title: "Mesa Removida", description: "A mesa foi removida com sucesso." });
  };

  const handleEditClick = (table: TableData) => {
    setEditingTable(table);
    setIsFormOpen(true);
  };
  
  const handleAddClick = () => {
    setEditingTable(null);
    setIsFormOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
      setIsFormOpen(open);
      if (!open) {
          setEditingTable(null);
      }
  };

  return (
    <>
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline text-3xl font-bold flex items-center gap-2">
                <TableIcon />
                Configuração de Mesas
            </CardTitle>
            <CardDescription>
              Adicione e edite as mesas do seu restaurante.
            </CardDescription>
        </div>
         <Dialog open={isFormOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
                <Button onClick={handleAddClick}>
                    <PlusCircle className="mr-2"/>
                    Adicionar Mesa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">
                        {editingTable ? "Editar Mesa" : "Nova Mesa"}
                    </DialogTitle>
                </DialogHeader>
                 <TableForm
                    onSubmit={handleFormSubmit}
                    table={editingTable}
                    allTables={currentTables}
                />
            </DialogContent>
         </Dialog>
      </CardHeader>
      <CardContent>
         <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mesa</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Combinável Com</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTables && currentTables.length > 0 ? (
                currentTables
                  .sort((a,b) => a.priority - b.priority || (parseInt(a.number) - parseInt(b.number)))
                  .map((table) => (
                    <TableRow key={table.id}>
                      <TableCell className="font-semibold">{table.number}</TableCell>
                      <TableCell>{table.capacity} pessoas</TableCell>
                      <TableCell>{table.priority}</TableCell>
                       <TableCell>
                        <div className="flex items-center gap-1 flex-wrap">
                          {table.combinableWith && table.combinableWith.length > 0 ? (
                            table.combinableWith.map(id => {
                                const linkedTable = currentTables.find(t => t.id === id);
                                return (
                                   <Badge key={id} variant="outline" className="gap-1">
                                    <Link2 className="h-3 w-3"/>
                                    {linkedTable ? linkedTable.number : 'N/A'}
                                   </Badge>
                                );
                            })
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" title="Editar Mesa" onClick={() => handleEditClick(table)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" title="Excluir Mesa">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Excluir</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir a mesa "{table.number}"?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. A mesa será permanentemente removida.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(table.id)}>Confirmar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Nenhuma mesa cadastrada. Clique em "Adicionar Mesa" para começar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
