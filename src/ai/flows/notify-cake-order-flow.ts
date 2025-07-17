
'use server';
/**
 * @fileOverview An AI flow to notify stakeholders about a cake order.
 * 
 * - notifyCakeOrder - A function that handles the notification process.
 * - NotifyCakeOrderInput - Input type for the function.
 * - NotifyCakeOrderOutput - Return type for the function (the generated notifications).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const NotifyCakeOrderInputSchema = z.object({
    restaurantName: z.string().describe('The name of the restaurant where the reservation is.'),
    restaurantAddress: z.string().describe('The full address of the restaurant for pickup.'),
    managerEmail: z.string().email().describe('The email address of the restaurant manager.'),
    bakeryEmail: z.string().email().describe('The email address of the partner bakery.'),
    reservationDate: z.string().describe('The date of the reservation (e.g., "dd/MM/yyyy").'),
    reservationTime: z.string().describe('The time of the reservation (e.g., "19:30").'),
    reservationName: z.string().describe('The name on the reservation.'),
});
export type NotifyCakeOrderInput = z.infer<typeof NotifyCakeOrderInputSchema>;

const NotifyCakeOrderOutputSchema = z.object({
    bakeryNotification: z.string(),
    managerNotification: z.string(),
});
export type NotifyCakeOrderOutput = z.infer<typeof NotifyCakeOrderOutputSchema>;

export async function notifyCakeOrder(input: NotifyCakeOrderInput): Promise<NotifyCakeOrderOutput> {
    return notifyCakeOrderFlow(input);
}

const bakeryPrompt = ai.definePrompt({
    name: 'bakeryNotificationPrompt',
    input: { schema: NotifyCakeOrderInputSchema },
    prompt: `
        Você é um sistema de automação de pedidos. Gere uma notificação CLARA e DIRETA para uma panificadora parceira.

        INSTRUÇÕES:
        - O email deve ser funcional e fácil de entender.
        - Use um tom profissional e direto.
        - Não adicione saudações ou despedidas desnecessárias.
        - O assunto do email deve ser: "NOVO PEDIDO DE BOLO - Restaurante {{{restaurantName}}}"
        
        CORPO DO EMAIL:
        
        Um novo pedido de bolo de comemoração foi confirmado.
        
        **Detalhes do Pedido:**
        - **Produto:** 1x Bolo de Comemoração Padrão (Chocolate com Frutas Vermelhas)
        - **Cliente Final (Reserva):** {{{reservationName}}}
        - **Data de Preparo:** O bolo deve estar pronto na manhã do dia **{{{reservationDate}}}**.
        
        A equipe do restaurante {{{restaurantName}}} irá retirar o bolo.
        
        Por favor, confirme o recebimento deste pedido. O pagamento já foi efetuado.
    `,
});

const managerPrompt = ai.definePrompt({
    name: 'managerNotificationPrompt',
    input: { schema: NotifyCakeOrderInputSchema },
    prompt: `
        Você é um sistema de automação de restaurante. Gere uma notificação interna para o GERENTE sobre uma nova encomenda de bolo.

        INSTRUÇÕES:
        - O tom deve ser informativo e conciso.
        - O assunto do email deve ser: "AÇÃO NECESSÁRIA: Encomenda de Bolo para Reserva de {{{reservationName}}}"

        CORPO DO EMAIL:
        
        Olá,
        
        Uma encomenda de bolo foi confirmada e paga para a reserva de **{{{reservationName}}}**.
        
        **Detalhes da Reserva Associada:**
        - **Data:** {{{reservationDate}}}
        - **Hora:** {{{reservationTime}}}
        
        **AÇÕES NECESSÁRIAS:**
        1.  **RETIRADA DO BOLO:** Coordenar a busca do bolo na panificadora parceira na manhã do dia **{{{reservationDate}}}**.
            - **Endereço da Panificadora:** Rua dos Confeiteiros, 789, Bairro Doce, São Paulo - SP.
        
        2.  **CONFIRMAÇÃO:** Uma notificação de produção já foi enviada para a panificadora ({{{bakeryEmail}}}).
        
        3.  **SISTEMA:** Uma nota sobre o bolo pago já foi adicionada automaticamente na reserva do cliente.
        
        Este é um lembrete para garantir que a operação ocorra sem problemas.
    `,
});


const notifyCakeOrderFlow = ai.defineFlow(
    {
        name: 'notifyCakeOrderFlow',
        inputSchema: NotifyCakeOrderInputSchema,
        outputSchema: NotifyCakeOrderOutputSchema,
    },
    async (input) => {
        console.log(`[Flow Start] Notifying for cake order at ${input.restaurantName}`);
        
        const { text: bakeryNotification } = await bakeryPrompt(input);
        console.log('--- BAKERY NOTIFICATION ---');
        console.log(`To: ${input.bakeryEmail}`);
        console.log(bakeryNotification);
        console.log('---------------------------');
        
        const { text: managerNotification } = await managerPrompt(input);
        console.log('--- MANAGER NOTIFICATION ---');
        console.log(`To: ${input.managerEmail}`);
        console.log(managerNotification);
        console.log('----------------------------');

        console.log('[Flow End] Notifications sent successfully.');

        return {
            bakeryNotification,
            managerNotification,
        };
    }
);
