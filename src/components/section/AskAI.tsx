"use client";

import { useState } from "react";
import OpenAI from "openai";

import { Separator } from "@/components/ui/separator";
import { IconPlus } from "@tabler/icons-react";
import { ArrowUpIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  InputGroupTextarea,
  InputGroupButton,
} from "@/components/ui/input-group";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AskAI() {
  const [response, setResponse] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  // Create the HF router client
  const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.NEXT_PUBLIC_HF_TOKEN,
    dangerouslyAllowBrowser: true, // Allow client usage in browser
  });

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      
      const completion = await client.chat.completions.create({
        model: "moonshotai/Kimi-K2-Thinking",
        messages: [
          {
            role: "system",
            content:
              "You are a specialist assistant that ONLY answers questions about Data Structures and Algorithms (DSA). If a user asks anything else, reply exactly: \"I only provide information related to Data Structures & Algorithms. If you have a DSA question, please ask it.\"",
          },
          {
            role: "user",
            content: question,
          },
        ],
        temperature: 0,
        max_tokens: 400,
      });
      setLoading(false);
      setResponse(completion.choices?.[0]?.message?.content || "No response");
    } catch (err) {
      setLoading(false);
      setResponse("Error occurred");
    }
  };

  return (
    <div className="p-5 flex flex-col gap-4 min-w-4xl mx-auto items-center justify-center">
      <InputGroup className="max-w-lg">
        <InputGroupTextarea
          placeholder="Ask, Search or Chat..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <InputGroupAddon align="block-end">
          <InputGroupButton variant="outline" className="rounded-full" size="icon-xs">
            <IconPlus />
          </InputGroupButton>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton variant="ghost">Auto</InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="[--radius:0.95rem]"
            >
              <DropdownMenuItem>Auto</DropdownMenuItem>
              <DropdownMenuItem>Agent</DropdownMenuItem>
              <DropdownMenuItem>Manual</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <InputGroupText className="ml-auto">52% used</InputGroupText>

          <Separator orientation="vertical" className="h-4" />

          <InputGroupButton
            variant="default"
            className="rounded-full hover:bg-white hover:text-black"
            size="icon-xs"
            onClick={askAI}
          >
            <ArrowUpIcon />
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      <p>{ loading ? <span className="text-gray-600">Generating Response...</span> : response}</p>
    </div>
  );
}
