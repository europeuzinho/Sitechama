
'use server';
/**
 * @fileOverview An AI flow to generate a restaurant description.
 * 
 * - generateRestaurantDescription - A function that generates a description.
 * - GenerateRestaurantDescriptionInput - Input type for the function.
 * - GenerateRestaurantDescriptionOutput - Return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateRestaurantDescriptionInputSchema = z.object({
    restaurantName: z.string().describe('The name of the restaurant.'),
    restaurantType: z.string().describe('The type/category of the restaurant (e.g., italiana, japonesa, bar).'),
});
export type GenerateRestaurantDescriptionInput = z.infer<typeof GenerateRestaurantDescriptionInputSchema>;

export type GenerateRestaurantDescriptionOutput = string;

export async function generateRestaurantDescription(input: GenerateRestaurantDescriptionInput): Promise<GenerateRestaurantDescriptionOutput> {
    return generateRestaurantDescriptionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateRestaurantDescriptionPrompt',
    input: { schema: GenerateRestaurantDescriptionInputSchema },
    prompt: `Você é um copywriter especialista em gastronomia. Sua tarefa é criar uma descrição curta (2-3 frases), atraente e convidativa para um restaurante.

Use um tom caloroso e profissional. Destaque a essência da experiência que o restaurante oferece.

Nome do Restaurante: {{{restaurantName}}}
Tipo de Culinária: {{{restaurantType}}}

Gere apenas o texto da descrição, sem títulos ou formatação adicional.
`,
});

const generateRestaurantDescriptionFlow = ai.defineFlow(
    {
        name: 'generateRestaurantDescriptionFlow',
        inputSchema: GenerateRestaurantDescriptionInputSchema,
        outputSchema: z.string(),
    },
    async (input) => {
        const { text } = await prompt(input);
        return text;
    }
);
