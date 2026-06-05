import {Inngest, openaiResponses} from "inngest"


export const inngest = new Inngest({
    id : "my-ai"
})

export const  gpt4oMini = openaiResponses({
    model : 'gpt-4o-mini' , 
    apiKey : process.env.OPENAI_API_KEY
})