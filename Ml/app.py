from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage,HumanMessage,AIMessage
load_dotenv()


messages  = [
    
    SystemMessage("You are an expert in social media contant statergy"),
    HumanMessage("give me short tip to create enggaging posts for my instagram")
]

llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro")

response = llm.invoke(messages)

print(response.content)

