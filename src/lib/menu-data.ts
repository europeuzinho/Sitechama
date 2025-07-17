

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    category: 'Entradas' | 'Pratos Principais' | 'Sobremesas' | 'Bebidas';
    department: 'Cozinha' | 'Copa';
    printGroup: string; // e.g., 'Chapa', 'Fritadeira', 'Saladas', 'Drinks'
    tags?: Array<'Novo' | 'Mais Pedido' | 'Vegetariano' | 'Sem Glúten'>;
    isVisible?: boolean;
    createdAt: string; // ISO string
}

export const menuData: Record<string, MenuItem[]> = {
  'cantina-nonna': [
    // Entradas
    { id: '201', name: 'Bruschetta al Pomodoro', description: 'Pão italiano tostado com tomate fresco, alho, manjericão e azeite extra virgem.', price: 'R$ 35,00', image: 'https://images.unsplash.com/photo-1579684340113-d34e2b027c5b?q=80&w=2070&auto=format&fit=crop', category: 'Entradas', department: 'Cozinha', printGroup: 'Entradas Frias', tags: ['Mais Pedido', 'Vegetariano'], isVisible: true, createdAt: new Date().toISOString() },
    { id: '202', name: 'Carpaccio di Manzo', description: 'Finas fatias de carne bovina, rúcula, lascas de parmesão e molho de alcaparras.', price: 'R$ 45,00', image: 'https://images.unsplash.com/photo-1599974538885-3b76a6b5a746?q=80&w=1974&auto=format&fit=crop', category: 'Entradas', department: 'Cozinha', printGroup: 'Entradas Frias', tags: ['Sem Glúten'], isVisible: true, createdAt: new Date().toISOString() },
    { id: '203', name: 'Arancini Siciliani', description: 'Bolinhos de risoto recheados com ragu de carne e muçarela, fritos até dourar.', price: 'R$ 38,00', image: 'https://images.unsplash.com/photo-1628457270533-312d8a5a2b0a?q=80&w=2070&auto=format&fit=crop', category: 'Entradas', department: 'Cozinha', printGroup: 'Fritadeira', isVisible: true, createdAt: new Date().toISOString() },
    
    // Pratos Principais
    { id: '204', name: 'Spaghetti Carbonara', description: 'Massa italiana com ovos, queijo pecorino, pancetta crocante e pimenta preta.', price: 'R$ 75,00', image: 'https://images.unsplash.com/photo-1608796881944-e22c4f559a3a?q=80&w=1974&auto=format&fit=crop', category: 'Pratos Principais', department: 'Cozinha', printGroup: 'Massas', isVisible: true, createdAt: new Date().toISOString() },
    { id: '205', name: 'Lasagna alla Bolognese', description: 'Camadas de massa fresca, ragu de carne, molho bechamel e queijo parmesão gratinado.', price: 'R$ 80,00', image: 'https://images.unsplash.com/photo-1574894709920-31b2e3d5b7e4?q=80&w=2070&auto=format&fit=crop', category: 'Pratos Principais', department: 'Cozinha', printGroup: 'Forno', tags: ['Mais Pedido'], isVisible: true, createdAt: new Date().toISOString() },
    { id: '206', name: 'Ravioli de Espinafre com Ricota', description: 'Massa fresca recheada com espinafre e ricota ao molho de manteiga e sálvia.', price: 'R$ 72,00', image: 'https://images.unsplash.com/photo-1588015323901-a6741c44a73c?q=80&w=1974&auto=format&fit=crop', category: 'Pratos Principais', department: 'Cozinha', printGroup: 'Massas', tags: ['Novo', 'Vegetariano'], isVisible: true, createdAt: new Date().toISOString() },
    { id: '207', name: 'Risotto ai Funghi', description: 'Risoto cremoso com mix de cogumelos selvagens e azeite trufado.', price: 'R$ 82,00', image: 'https://images.unsplash.com/photo-1618946333288-d4a3767e0b5f?q=80&w=1974&auto=format&fit=crop', category: 'Pratos Principais', department: 'Cozinha', printGroup: 'Risotos', tags: ['Vegetariano', 'Sem Glúten'], isVisible: true, createdAt: new Date().toISOString() },

    // Sobremesas
    { id: '208', name: 'Tiramisù Classico', description: 'Clássica sobremesa italiana com biscoito champagne, café, mascarpone e cacau.', price: 'R$ 40,00', image: 'https://images.unsplash.com/photo-1571115332238-9a30d20786a9?q=80&w=2062&auto=format&fit=crop', category: 'Sobremesas', department: 'Cozinha', printGroup: 'Sobremesas', tags: ['Mais Pedido'], isVisible: true, createdAt: new Date().toISOString() },
    { id: '209', name: 'Panna Cotta com Calda de Frutas Vermelhas', description: 'Doce de nata cozida com uma deliciosa calda de frutas vermelhas frescas.', price: 'R$ 38,00', image: 'https://images.unsplash.com/photo-1527159749095-b2848979c13b?q=80&w=1974&auto=format&fit=crop', category: 'Sobremesas', department: 'Cozinha', printGroup: 'Sobremesas', isVisible: true, createdAt: new Date().toISOString() },

    // Bebidas
    { id: '210', name: 'Água Mineral', description: 'Com ou sem gás.', price: 'R$ 8,00', image: 'https://images.unsplash.com/photo-1583115260445-f947171e12c7?q=80&w=1974&auto=format&fit=crop', category: 'Bebidas', department: 'Copa', printGroup: 'Bebidas Gerais', isVisible: true, createdAt: new Date().toISOString() },
    { id: '211', name: 'Refrigerante', description: 'Coca-Cola, Guaraná, etc.', price: 'R$ 9,00', image: 'https://images.unsplash.com/photo-1567103472667-6898f3a79cf2?q=80&w=1974&auto=format&fit=crop', category: 'Bebidas', department: 'Copa', printGroup: 'Bebidas Gerais', isVisible: true, createdAt: new Date().toISOString() },
    { id: '212', name: 'Vinho da Casa (Taça)', description: 'Tinto ou branco.', price: 'R$ 25,00', image: 'https://images.unsplash.com/photo-1598432431135-77dc364cca7c?q=80&w=1974&auto=format&fit=crop', category: 'Bebidas', department: 'Copa', printGroup: 'Vinhos', isVisible: true, createdAt: new Date().toISOString() },
  ],
  'sushi-kawa': [
    { id: '301', name: 'Edamame', description: 'Vagem de soja cozida no vapor com flor de sal.', price: 'R$ 25,00', image: 'https://images.unsplash.com/photo-1542640244-e242d31844a4?q=80&w=1964&auto=format&fit=crop', category: 'Entradas', department: 'Cozinha', printGroup: 'Entradas Quentes', tags: ['Vegetariano', 'Sem Glúten'], isVisible: true, createdAt: new Date().toISOString() },
    { id: '302', name: 'Combinado do Chef (18 peças)', description: 'Seleção especial de sashimis, niguiris e uramakis.', price: 'R$ 98,00', image: 'https://images.unsplash.com/photo-1554569111-9a997d31f0f1?q=80&w=1964&auto=format&fit=crop', category: 'Pratos Principais', department: 'Cozinha', printGroup: 'Sushibar', tags: ['Mais Pedido'], isVisible: true, createdAt: new Date().toISOString() },
    { id: '303', name: 'Hot Roll de Salmão', description: 'Enrolado de salmão empanado com cream cheese e molho tarê.', price: 'R$ 42,00', image: 'https://images.unsplash.com/photo-1625944230154-213374591a14?q=80&w=1974&auto=format&fit=crop', category: 'Pratos Principais', department: 'Cozinha', printGroup: 'Fritadeira', isVisible: true, createdAt: new Date().toISOString() },
    { id: '304', name: 'Lamen de Miso', description: 'Caldo à base de misô, macarrão, chashu de porco e ovo marinado.', price: 'R$ 65,00', image: 'https://images.unsplash.com/photo-1574482624532-35b917d15a4f?q=80&w=1974&auto=format&fit=crop', category: 'Pratos Principais', department: 'Cozinha', printGroup: 'Entradas Quentes', isVisible: true, createdAt: new Date().toISOString() },
  ],
  'sabor-da-terra': [
    { id: '601', name: 'Moqueca de Peixe', description: 'Peixe branco cozido com azeite de dendê, leite de coco e pimentões. Acompanha arroz e farofa.', price: 'R$ 95,00', image: 'https://images.unsplash.com/photo-1626202157924-a4b3d5519894?q=80&w=2070&auto=format&fit=crop', category: 'Pratos Principais', department: 'Cozinha', printGroup: 'Fogão', tags: ['Mais Pedido'], isVisible: true, createdAt: new Date().toISOString() },
    { id: '602', name: 'Baião de Dois Completo', description: 'Arroz, feijão fradinho, carne seca, queijo coalho e coentro.', price: 'R$ 70,00', image: 'https://images.unsplash.com/photo-1682354270482-b725c43d3b66?q=80&w=2070&auto=format&fit=crop', category: 'Pratos Principais', department: 'Cozinha', printGroup: 'Fogão', isVisible: true, createdAt: new Date().toISOString() },
    { id: '603', name: 'Dadinho de Tapioca', description: 'Cubos de tapioca com queijo coalho, servido com geleia de pimenta.', price: 'R$ 35,00', image: 'https://images.unsplash.com/photo-1620005743384-36523dd06240?q=80&w=1964&auto=format&fit=crop', category: 'Entradas', department: 'Cozinha', printGroup: 'Fritadeira', tags: ['Vegetariano'], isVisible: true, createdAt: new Date().toISOString() },
    { id: '604', name: 'Pudim de Leite', description: 'Clássico pudim de leite condensado com calda de caramelo.', price: 'R$ 30,00', image: 'https://images.unsplash.com/photo-1589954310344-323a085a6a65?q=80&w=2070&auto=format&fit=crop', category: 'Sobremesas', department: 'Cozinha', printGroup: 'Sobremesas', isVisible: true, createdAt: new Date().toISOString() },
  ],
  'the-rusty-anchor': [
    { id: '701', name: 'Batata Frita Rústica', description: 'Batatas crocantes com alecrim e maionese da casa.', price: 'R$ 38,00', image: 'https://images.unsplash.com/photo-1599921868465-b733328e8a60?q=80&w=1974&auto=format&fit=crop', category: 'Entradas', department: 'Cozinha', printGroup: 'Fritadeira', tags: ['Mais Pedido', 'Vegetariano'], isVisible: true, createdAt: new Date().toISOString() },
    { id: '702', name: 'Dadinho de Tapioca', description: 'Cubos de tapioca com queijo coalho, acompanha geleia de pimenta.', price: 'R$ 45,00', image: 'https://images.unsplash.com/photo-1620005743384-36523dd06240?q=80&w=1964&auto=format&fit=crop', category: 'Entradas', department: 'Cozinha', printGroup: 'Fritadeira', tags: ['Vegetariano'], isVisible: true, createdAt: new Date().toISOString() },
    { id: '703', name: 'Chopp Artesanal (500ml)', description: 'Pilsen local, leve e refrescante.', price: 'R$ 18,00', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=1974&auto=format&fit=crop', category: 'Bebidas', department: 'Copa', printGroup: 'Chopeira', isVisible: true, createdAt: new Date().toISOString() },
    { id: '704', name: 'Caipirinha de Limão', description: 'Cachaça, limão, açúcar e gelo. O clássico brasileiro.', price: 'R$ 28,00', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=2157&auto=format&fit=crop', category: 'Bebidas', department: 'Copa', printGroup: 'Cocktails', isVisible: true, createdAt: new Date().toISOString() },
  ]
};
