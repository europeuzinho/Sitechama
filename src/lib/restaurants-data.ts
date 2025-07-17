

import type { LucideIcon } from 'lucide-react';
import { Utensils, Beer, Fish, Pizza, Grape, Soup, Sandwich, Wheat, CakeSlice, Salad, Beef } from 'lucide-react';

export interface GalleryImage {
  url: string;
  hint: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  rating: number;
  comment: string;
  date: string; // ISO 8601 date string
}

export interface Employee {
  id: string;
  name: string;
  role: 'Copa' | 'Cozinha' | 'Recepção' | 'Caixa' | 'Garçom';
  login: string;
  password: string;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  priority: number; // Lower is higher priority for assignment
  combinableWith?: string[]; // IDs of other tables it can be combined with
  status: 'available' | 'occupied';
}

export interface CakeOrderSettings {
    enabled: boolean;
    name: string;
    description: string;
    price: number;
    pixKey: string;
}

export interface PayoutSettings {
    cnpj: string;
    bankName: string;
    agency: string;
    accountNumber: string;
    accountType: 'corrente' | 'poupanca';
}

export interface PrinterSettings {
    cozinha: string;
    copa: string;
    caixa: string;
}


export interface Restaurant {
  id: string;
  name: string;
  location: string;
  logo: string;
  image: string;
  ownerEmail: string;
  plan?: 'Insights' | 'Digital' | 'Completo';
  pin: string; // 4-digit PIN for sensitive operations
  description: string;
  galleryImages: GalleryImage[];
  category: 'italiana' | 'japonesa' | 'francesa' | 'brasileira' | 'bar' | 'lanchonete' | 'asiatica' | 'arabe' | 'doceria' | 'saudavel' | 'carnes';
  address: string;
  phone: string;
  sac: string;
  reviews: Review[];
  tables: Table[];
  employees?: Employee[];
  blockedDates?: string[]; // yyyy-MM-dd
  cakeOrderSettings: CakeOrderSettings;
  payoutSettings: PayoutSettings;
  printerSettings?: PrinterSettings;
  createdAt: string; // ISO 8601 date string
}

export type NewRestaurant = Omit<Restaurant, 'id' | 'reviews' | 'createdAt' | 'tables' | 'cakeOrderSettings' | 'payoutSettings' | 'printerSettings'>;

const RESTAURANTS_STORAGE_KEY = 'restaurants';


const initialRestaurants: Restaurant[] = [
  // Italianos
  {
    id: 'trattoria-del-ponte',
    name: 'Trattoria del Ponte',
    location: 'Centro da Cidade',
    logo: 'https://i.ibb.co/qj5bW3S/dishes-2.png',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop',
    ownerEmail: 'gerente.trattoria@example.com',
    plan: 'Digital',
    pin: '1234',
    description: 'A Trattoria del Ponte traz um pedaço da Itália para o coração da cidade. Com receitas de família passadas por gerações, nosso ambiente acolhedor e rústico é o cenário perfeito para uma refeição memorável. Valorizamos ingredientes frescos e um serviço que faz você se sentir em casa.',
    galleryImages: [
        { url: 'https://images.unsplash.com/photo-1529408686214-b48b8532f72c?q=80&w=2070&auto=format&fit=crop', hint: 'restaurant interior' },
        { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop', hint: 'pasta dish' },
        { url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2070&auto=format&fit=crop', hint: 'wine glass' },
    ],
    category: 'italiana',
    address: 'Rua das Flores, 123, Centro',
    phone: '(11) 1234-5678',
    sac: 'contato@trattoriadelponte.com',
    reviews: [
      { id: 'r1', userId: 'user1', userName: 'Carlos Silva', userImage: 'https://i.ibb.co/P9vL1Rf/user-1.png', rating: 5, comment: 'Comida fantástica e ambiente muito agradável. A melhor massa que já comi em anos! Recomendo o spaghetti à carbonara, é divino. Voltarei com certeza!', date: '2024-05-20T10:00:00Z' },
      { id: 'r2', userId: 'user2', userName: 'Maria Oliveira', userImage: 'https://i.ibb.co/yNNSxW9/user-2.png', rating: 4, comment: 'Ótimo serviço e localização. A lasanha estava muito boa, mas poderia ser uma porção um pouco maior pelo preço. O Tiramisù de sobremesa estava perfeito.', date: '2024-05-18T15:30:00Z' }
    ],
    tables: [
        { id: 'tdp1', number: '1A', capacity: 2, priority: 1, combinableWith: ['tdp2'], status: 'available' },
        { id: 'tdp2', number: '1B', capacity: 2, priority: 2, combinableWith: ['tdp1'], status: 'available' },
        { id: 'tdp3', number: '2', capacity: 2, priority: 3, status: 'available' },
        { id: 'tdp4', number: '3A', capacity: 4, priority: 1, combinableWith: ['tdp5'], status: 'occupied' },
        { id: 'tdp5', number: '3B', capacity: 4, priority: 2, combinableWith: ['tdp4'], status: 'available' },
        { id: 'tdp6', number: '4', capacity: 4, priority: 3, status: 'available' },
        { id: 'tdp7', number: '10', capacity: 6, priority: 1, status: 'available' },
        { id: 'tdp8', number: '11', capacity: 8, priority: 1, status: 'available' }
    ],
    employees: [
        { id: 'emp-tdp-1', name: 'Marco Rossi', role: 'Cozinha', login: '1010', password: '1' },
        { id: 'emp-tdp-2', name: 'Giulia Bianchi', role: 'Recepção', login: '2020', password: '1' },
        { id: 'emp-tdp-3', name: 'Luca Marino', role: 'Caixa', login: '3030', password: '1' },
    ],
    blockedDates: [],
    cakeOrderSettings: {
        enabled: true,
        name: 'Torta de Chocolate com Frutas Vermelhas',
        description: 'Deliciosa torta de chocolate meio amargo com uma generosa camada de frutas vermelhas frescas. Perfeita para celebrar momentos especiais.',
        price: 120.00,
        pixKey: '00020126330014BR.GOV.BCB.PIX0111111111111115204000053039865405120.005802BR5917Chama Inc6009Sao Paulo62070503***6304ABCD'
    },
    payoutSettings: {
        cnpj: '12.345.678/0001-99',
        bankName: 'Banco Digital S.A.',
        agency: '0001',
        accountNumber: '123456-7',
        accountType: 'corrente'
    },
    printerSettings: {
        cozinha: 'Impressora Cozinha (Epson TM-T20)',
        copa: 'Impressora Bar (Bematech MP-4200)',
        caixa: 'Impressora Caixa (Daruma DR800)',
    },
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cantina-nonna',
    name: 'Cantina Nonna',
    location: 'Vila Madalena',
    logo: 'https://i.ibb.co/6yv7zQP/dishes-3.png',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2070&auto=format&fit=crop',
    ownerEmail: 'gerente.nonna@example.com',
    plan: 'Completo',
    pin: '1234',
    description: 'Inspirada nas cantinas do sul da Itália, a Cantina Nonna oferece uma experiência gastronômica vibrante e autêntica. Nossas massas são feitas artesanalmente todos os dias e nossos molhos seguem as tradições italianas. Um lugar para celebrar a vida com boa comida e bom vinho.',
    galleryImages: [
        { url: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1974&auto=format&fit=crop', hint: 'rustic restaurant' },
        { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop', hint: 'italian food' },
        { url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2070&auto=format&fit=crop', hint: 'pizza on table' },
    ],
    category: 'italiana',
    address: 'Av. Brigadeiro Faria Lima, 456, Vila Madalena',
    phone: '(11) 2345-6789',
    sac: 'atendimento@cantinadanonna.com',
    reviews: [
      { id: 'r-cn-1', userId: 'user3', userName: 'Juliana Costa', userImage: 'https://i.ibb.co/yBvG9S3/user-3.png', rating: 5, comment: 'Lugar perfeito para um jantar em família. Ambiente barulhento e feliz, como uma verdadeira cantina. A pizza é maravilhosa, massa fininha e crocante.', date: '2024-05-22T20:00:00Z' },
      { id: 'r-cn-2', userId: 'user4', userName: 'Pedro Martins', userImage: 'https://i.ibb.co/xL9yZ28/user-4.png', rating: 4, comment: 'A comida é excelente, mas o restaurante estava muito cheio e o serviço um pouco lento. Vale a pena pela comida, mas vá com paciência.', date: '2024-05-19T21:00:00Z' }
    ],
    tables: [
      { id: 'cn1', number: '1', capacity: 2, priority: 1, combinableWith: ['cn2'], status: 'available' },
      { id: 'cn2', number: '2', capacity: 2, priority: 1, combinableWith: ['cn1'], status: 'available' },
      { id: 'cn3', number: '3', capacity: 2, priority: 2, status: 'available' },
      { id: 'cn4', number: '10', capacity: 4, priority: 1, status: 'occupied' },
      { id: 'cn5', number: '11', capacity: 4, priority: 1, combinableWith: ['cn6'], status: 'available' },
      { id: 'cn6', number: '12', capacity: 4, priority: 2, combinableWith: ['cn5'], status: 'available' },
      { id: 'cn7', number: '20', capacity: 8, priority: 1, status: 'available' }
    ],
    employees: [
        { id: 'emp-cn-1', name: 'Sofia Ricci', role: 'Garçom', login: '4040', password: '1' },
        { id: 'emp-cn-2', name: 'Antonio Gallo', role: 'Cozinha', login: '5050', password: '1' },
    ],
    blockedDates: [],
    cakeOrderSettings: {
        enabled: true,
        name: 'Bolo da Nonna (Fubá com Goiabada)',
        description: 'Um clássico da casa, o bolo de fubá cremoso com pedaços de goiabada artesanal é a escolha perfeita para um café da tarde ou uma sobremesa afetuosa.',
        price: 95.00,
        pixKey: '00020126330014BR.GOV.BCB.PIX011122222222222520400005303986540595.005802BR5913CANTINA NONNA6009Sao Paulo62070503***6304EFGH'
    },
     payoutSettings: {
        cnpj: '',
        bankName: '',
        agency: '',
        accountNumber: '',
        accountType: 'corrente'
    },
    createdAt: '2024-02-20T11:00:00Z'
  },
  // Japoneses
  {
    id: 'sushi-kawa',
    name: 'Sushi Kawa',
    location: 'Bairro Jardins',
    logo: 'https://i.ibb.co/VMyPzgn/dishes-4.png',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=1974&auto=format&fit=crop',
    ownerEmail: 'gerente.kawa@example.com',
    plan: 'Digital',
    pin: '1234',
    description: 'Sushi Kawa significa "Rio de Sushi", e nossa missão é trazer um fluxo constante de sabores frescos e criativos. Combinamos a precisão da culinária japonesa tradicional com toques contemporâneos, em um ambiente elegante e minimalista. Nossos peixes são selecionados diariamente para garantir a máxima qualidade.',
    galleryImages: [
        { url: 'https://images.unsplash.com/photo-1611141654212-3abb0e183733?q=80&w=2070&auto=format&fit=crop', hint: 'sushi platter' },
        { url: 'https://images.unsplash.com/photo-1617470702894-39650b656122?q=80&w=2070&auto=format&fit=crop', hint: 'japanese interior' },
        { url: 'https://images.unsplash.com/photo-1580822345834-353284a59241?q=80&w=2070&auto=format&fit=crop', hint: 'sake bottle' },
    ],
    category: 'japonesa',
    address: 'Rua Oscar Freire, 789, Jardins',
    phone: '(11) 3456-7890',
    sac: 'contato@sushikawa.com.br',
    reviews: [
      { id: 'r3', userId: 'u3', userName: 'Ana Pereira', userImage: 'https://i.ibb.co/dD4yN5z/user-5.png', rating: 5, comment: 'Peixe super fresco, o melhor da região! O ambiente é muito sofisticado e o atendimento impecável. O combinado do chef vale cada centavo.', date: '2024-05-21T19:00:00Z' }
    ],
    tables: [
        { id: 'sk1', number: 'Balcão 1', capacity: 1, priority: 1, status: 'available' },
        { id: 'sk2', number: 'Balcão 2', capacity: 1, priority: 1, status: 'available' },
        { id: 'sk3', number: 'Balcão 3', capacity: 1, priority: 1, status: 'occupied' },
        { id: 'sk4', number: 'Balcão 4', capacity: 1, priority: 1, status: 'available' },
        { id: 'sk5', number: 'M10', capacity: 2, priority: 1, status: 'available' },
        { id: 'sk6', number: 'M11', capacity: 2, priority: 2, status: 'available' },
        { id: 'sk7', number: 'M20', capacity: 4, priority: 1, status: 'occupied' },
        { id: 'sk8', number: 'M21', capacity: 4, priority: 2, status: 'available' },
        { id: 'sk9', number: 'Tatame', capacity: 6, priority: 1, status: 'available' }
    ],
    employees: [],
    blockedDates: [],
    cakeOrderSettings: {
        enabled: false,
        name: '',
        description: '',
        price: 0,
        pixKey: ''
    },
    payoutSettings: {
        cnpj: '',
        bankName: '',
        agency: '',
        accountNumber: '',
        accountType: 'corrente'
    },
    createdAt: '2024-03-10T12:00:00Z'
  },
   {
    id: 'izakaya-matsu',
    name: 'Izakaya Matsu',
    location: 'Liberdade',
    logo: 'https://i.ibb.co/yQxGjD4/dishes.png',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1925&auto=format&fit=crop',
    ownerEmail: 'gerente.matsu@example.com',
    plan: 'Insights',
    pin: '1234',
    description: 'O Izakaya Matsu é um autêntico boteco japonês, um refúgio para relaxar após o trabalho. Oferecemos uma vasta seleção de saquês e petiscos tradicionais (otsumami) para compartilhar. O ambiente é descontraído, ideal para encontros com amigos.',
    galleryImages: [
        { url: 'https://images.unsplash.com/photo-1565032204593-9a4c6a46d2a7?q=80&w=2070&auto=format&fit=crop', hint: 'japanese pub' },
        { url: 'https://images.unsplash.com/photo-1582452724933-59106064669e?q=80&w=1974&auto=format&fit=crop', hint: 'skewers food' },
        { url: 'https://images.unsplash.com/photo-1570598912143-652a8a5e018d?q=80&w=2070&auto=format&fit=crop', hint: 'people cheering' },
    ],
    category: 'japonesa',
    address: 'Rua Galvão Bueno, 101, Liberdade',
    phone: '(11) 4567-8901',
    sac: 'ajuda@izakayamatsu.jp',
    reviews: [],
    tables: [
        { id: 'im1', number: 'Balcão 1', capacity: 2, priority: 1, status: 'available' },
        { id: 'im2', number: 'Balcão 2', capacity: 2, priority: 1, status: 'occupied' },
        { id: 'im3', number: 'Mesa 1', capacity: 4, priority: 1, status: 'available' },
        { id: 'im4', number: 'Mesa 2', capacity: 4, priority: 2, status: 'available' },
        { id: 'im5', number: 'Grupo', capacity: 6, priority: 1, status: 'available' }
    ],
    employees: [],
    blockedDates: [],
    cakeOrderSettings: {
        enabled: false,
        name: '',
        description: '',
        price: 0,
        pixKey: ''
    },
    payoutSettings: {
        cnpj: '',
        bankName: '',
        agency: '',
        accountNumber: '',
        accountType: 'corrente'
    },
    createdAt: new Date().toISOString()
  },
  // Franceses
  {
    id: 'le-bistro-parisien',
    name: 'Le Bistrô Parisien',
    location: 'Zona Histórica',
    logo: 'https://i.ibb.co/hKx0c4S/dishes-1.png',
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=2070&auto=format&fit=crop',
    ownerEmail: 'gerente.bistro@example.com',
    plan: 'Insights',
    pin: '1234',
    description: 'No Le Bistrô Parisien, recriamos o charme e a elegância dos clássicos bistrôs de Paris. Nosso cardápio celebra a rica tradição da culinária francesa, com pratos como Coq au Vin e Crème Brûlée, preparados com técnica e paixão. Perfeito para um jantar romântico ou uma ocasião especial.',
    galleryImages: [
        { url: 'https://images.unsplash.com/photo-1477764250597-dffe9f601ae8?q=80&w=2070&auto=format&fit=crop', hint: 'french bistro' },
        { url: 'https://images.unsplash.com/photo-1620894580129-58355418b73f?q=80&w=1964&auto=format&fit=crop', hint: 'coq au vin' },
        { url: 'https://images.unsplash.com/photo-1460306857413-43694f128b6d?q=80&w=2070&auto=format&fit=crop', hint: 'romantic dinner' },
    ],
    category: 'francesa',
    address: 'Praça da República, 202, Zona Histórica',
    phone: '(11) 5678-9012',
    sac: 'suporte@lebistro.fr',
    reviews: [],
    tables: [
        { id: 'lbp1', number: 'Janela 1', capacity: 2, priority: 1, status: 'available' },
        { id: 'lbp2', number: 'Janela 2', capacity: 2, priority: 1, status: 'occupied' },
        { id: 'lbp3', number: 'Salão 3', capacity: 2, priority: 2, status: 'available' },
        { id: 'lbp4', number: 'Salão 4', capacity: 2, priority: 3, status: 'available' },
        { id: 'lbp5', number: 'Salão 10', capacity: 4, priority: 1, status: 'available' },
        { id: 'lbp6', number: 'Salão 11', capacity: 4, priority: 1, status: 'occupied' }
    ],
    employees: [],
    blockedDates: [],
    cakeOrderSettings: {
        enabled: true,
        name: 'Crème Brûlée Gigante',
        description: 'Uma versão para compartilhar da nossa famosa sobremesa, com uma crosta de caramelo perfeitamente queimada. Ideal para 2 a 4 pessoas.',
        price: 85.00,
        pixKey: '00020126330014BR.GOV.BCB.PIX011133333333333520400005303986540585.005802BR5918LE BISTRO PARISIEN6009Sao Paulo62070503***6304IJKL'
    },
    payoutSettings: {
        cnpj: '',
        bankName: '',
        agency: '',
        accountNumber: '',
        accountType: 'corrente'
    },
    createdAt: '2024-04-05T14:00:00Z'
  },
  // Brasileiros
  {
    id: 'sabor-da-terra',
    name: 'Sabor da Terra',
    location: 'Orla da Praia',
    logo: 'https://i.ibb.co/GcvxPyc/logo-sabor-da-terra.png',
    image: 'https://images.unsplash.com/photo-1481931098730-318b6f776db0?q=80&w=1890&auto=format&fit=crop',
    ownerEmail: 'gerente.sabor@example.com',
    plan: 'Digital',
    pin: '1234',
    description: 'Com os pés na areia e o coração no Brasil, o Sabor da Terra celebra a diversidade da nossa culinária. De moquecas a feijoadas, nossos pratos são uma viagem pelos sabores regionais do país. Desfrute de uma refeição deliciosa com a brisa do mar como companhia.',
    galleryImages: [
        { url: 'https://images.unsplash.com/photo-1594025001929-2813133b3a4a?q=80&w=2070&auto=format&fit=crop', hint: 'moqueca dish' },
        { url: 'https://images.unsplash.com/photo-1540192902094-1a6c1652e937?q=80&w=2070&auto=format&fit=crop', hint: 'beach restaurant' },
        { url: 'https://images.unsplash.com/photo-1618171739268-33d3175c589b?q=80&w=1964&auto=format&fit=crop', hint: 'caipirinha drink' },
    ],
    category: 'brasileira',
    address: 'Av. Atlântica, 303, Orla',
    phone: '(21) 6789-0123',
    sac: 'faleconosco@sabordaterra.com.br',
    reviews: [],
    tables: [
        { id: 'sdt1', number: 'Varanda 1', capacity: 4, priority: 1, status: 'available' },
        { id: 'sdt2', number: 'Varanda 2', capacity: 4, priority: 1, status: 'available' },
        { id: 'sdt3', number: 'Salão 12', capacity: 4, priority: 2, status: 'occupied' },
        { id: 'sdt4', number: 'Salão 20', capacity: 6, priority: 1, combinableWith: ['sdt5'], status: 'available' },
        { id: 'sdt5', number: 'Salão 21', capacity: 6, priority: 2, combinableWith: ['sdt4'], status: 'available' },
        { id: 'sdt6', number: 'Grupo 30', capacity: 10, priority: 1, status: 'available' }
    ],
    employees: [],
    blockedDates: [],
    cakeOrderSettings: {
        enabled: false,
        name: '',
        description: '',
        price: 0,
        pixKey: ''
    },
    payoutSettings: {
        cnpj: '',
        bankName: '',
        agency: '',
        accountNumber: '',
        accountType: 'corrente'
    },
    createdAt: '2024-05-01T18:00:00Z'
  },
  // Bares
  {
    id: 'the-rusty-anchor',
    name: 'The Rusty Anchor',
    location: 'Centro Histórico',
    logo: 'https://i.ibb.co/mSChdms/logo-rusty-anchor.png',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop',
    ownerEmail: 'gerente.rusty@example.com',
    plan: 'Completo',
    pin: '1234',
    description: 'The Rusty Anchor é mais que um bar, é um ponto de encontro. Com uma decoração rústica e industrial, oferecemos uma seleção de cervejas artesanais, coquetéis clássicos e petiscos perfeitos para compartilhar. O lugar ideal para boa conversa e boa música.',
    galleryImages: [
        { url: 'https://images.unsplash.com/photo-1585250004940-1a7a4a9f9702?q=80&w=1974&auto=format&fit=crop', hint: 'craft beer' },
        { url: 'https://images.unsplash.com/photo-1543007631-283050bb3e8c?q=80&w=1974&auto=format&fit=crop', hint: 'rustic bar' },
        { url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=2070&auto=format&fit=crop', hint: 'burger fries' },
    ],
    category: 'bar',
    address: 'Rua da Quitanda, 404, Centro Histórico',
    phone: '(11) 7890-1234',
    sac: 'sac@therustyanchor.com',
    reviews: [],
    tables: [
        { id: 'tra1', number: 'Balcão', capacity: 8, priority: 10, status: 'occupied' },
        { id: 'tra2', number: 'Bistrô 1', capacity: 2, priority: 1, status: 'available' },
        { id: 'tra3', number: 'Bistrô 2', capacity: 2, priority: 2, status: 'available' },
        { id: 'tra4', number: 'Mesa 1', capacity: 4, priority: 1, status: 'available' },
        { id: 'tra5', number: 'Mesa 2', capacity: 4, priority: 2, status: 'occupied' },
        { id: 'tra6', number: 'Mesa 3', capacity: 4, priority: 3, status: 'available' },
        { id: 'tra7', number: 'Sofá', capacity: 6, priority: 1, status: 'available' }
    ],
    employees: [],
    blockedDates: [],
    cakeOrderSettings: {
        enabled: false,
        name: '',
        description: '',
        price: 0,
        pixKey: ''
    },
    payoutSettings: {
        cnpj: '',
        bankName: '',
        agency: '',
        accountNumber: '',
        accountType: 'corrente'
    },
    createdAt: new Date().toISOString()
  }
];

export const categories: Record<Restaurant['category'], { name: string, Icon: LucideIcon }> = {
    italiana: { name: 'Italiana', Icon: Pizza },
    japonesa: { name: 'Japonesa', Icon: Fish },
    lanchonete: { name: 'Lanchonete', Icon: Sandwich },
    brasileira: { name: 'Brasileira', Icon: Soup },
    francesa: { name: 'Francesa', Icon: Grape },
    asiatica: { name: 'Asiática', Icon: Utensils },
    arabe: { name: 'Árabe', Icon: Wheat },
    carnes: { name: 'Carnes', Icon: Beef },
    saudavel: { name: 'Saudável', Icon: Salad },
    doceria: { name: 'Doceria', Icon: CakeSlice },
    bar: { name: 'Bar', Icon: Beer },
};

export function getRestaurants(): Restaurant[] {
  if (typeof window === 'undefined') {
    return initialRestaurants;
  }
  try {
    const storedRestaurants = window.localStorage.getItem(RESTAURANTS_STORAGE_KEY);
    return storedRestaurants ? JSON.parse(storedRestaurants) : initialRestaurants;
  } catch (error) {
    console.error("Failed to parse restaurants from localStorage", error);
    return initialRestaurants;
  }
}

function saveRestaurants(restaurants: Restaurant[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RESTAURANTS_STORAGE_KEY, JSON.stringify(restaurants));
    window.dispatchEvent(new CustomEvent('restaurantsChanged'));
    window.dispatchEvent(new CustomEvent('reviewsChanged'));
  } catch (error: any) {
    console.error("Failed to save restaurants to localStorage", error);
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        alert("Erro: O armazenamento local está cheio. Não é possível salvar mais dados. Isso pode ser devido a imagens muito grandes no seu cardápio. Tente usar imagens com tamanho menor.");
    }
  }
}

export function updateTableStatus(restaurantId: string, tableId: string, newStatus: Table['status']) {
  const restaurants = getRestaurants();
  const restaurantIndex = restaurants.findIndex(r => r.id === restaurantId);
  if (restaurantIndex === -1) return;

  const tableIndex = restaurants[restaurantIndex].tables.findIndex(t => t.id === tableId);
  if (tableIndex === -1) return;
  
  // Only update if there are no comandas on the table
  const comandas = (typeof window !== 'undefined' && window.localStorage.getItem(`comandas-data-${restaurantId}`)) 
      ? JSON.parse(window.localStorage.getItem(`comandas-data-${restaurantId}`)!) 
      : [];
  const comandasOnTable = comandas.filter((c: any) => c.tableId === tableId && c.status !== 'available');
  if (newStatus === 'available' && comandasOnTable.length > 0) {
      return; // Do not free a table that still has active comandas
  }

  restaurants[restaurantIndex].tables[tableIndex].status = newStatus;
  saveRestaurants(restaurants);
}

export function addRestaurant(newRestaurantData: NewRestaurant): void {
  const restaurants = getRestaurants();
  const newRestaurant: Restaurant = {
    ...newRestaurantData,
    id: newRestaurantData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
    reviews: [],
    tables: [],
    employees: [],
    cakeOrderSettings: {
        enabled: false,
        name: 'Bolo de Aniversário Padrão',
        description: 'Bolo de chocolate com recheio de brigadeiro e cobertura de frutas vermelhas. Serve 10 pessoas.',
        price: 120.00,
        pixKey: ''
    },
    payoutSettings: {
        cnpj: '',
        bankName: '',
        agency: '',
        accountNumber: '',
        accountType: 'corrente'
    },
    createdAt: new Date().toISOString(),
  };
  const updatedRestaurants = [...restaurants, newRestaurant];
  saveRestaurants(updatedRestaurants);
}

export function updateRestaurant(updatedRestaurantData: Restaurant): void {
  const restaurants = getRestaurants();
  const updatedRestaurants = restaurants.map(r =>
    r.id === updatedRestaurantData.id ? updatedRestaurantData : r
  );
  saveRestaurants(updatedRestaurants);
}

export function addReview(
  restaurantId: string, 
  userId: string, 
  userName: string,
  userImage: string | null,
  rating: number,
  comment: string
): void {
  const restaurants = getRestaurants();
  const restaurant = restaurants.find(r => r.id === restaurantId);

  if (restaurant) {
    // Ensure reviews array exists
    if (!restaurant.reviews) {
        restaurant.reviews = [];
    }

    // Prevent duplicate reviews by the same user
    const hasAlreadyReviewed = restaurant.reviews.some(review => review.userId === userId);
    if (hasAlreadyReviewed) {
      console.warn("User has already reviewed this restaurant.");
      return;
    }

    const newReview: Review = {
      id: `review-${Date.now()}`,
      userId,
      userName,
      userImage,
      rating,
      comment,
      date: new Date().toISOString(),
    };
    
    restaurant.reviews.push(newReview);
    updateRestaurant(restaurant);
  }
}
