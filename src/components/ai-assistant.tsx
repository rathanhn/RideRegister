"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { improveText, ImproveTextInput } from "@/ai/flows/improve-text-suggestions";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AiAssistant() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [improvedText, setImprovedText] = useState("");
  const { toast } = useToast();

  const handleImproveText = async () => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter some text to improve.",
      });
      return;
    }
    setIsLoading(true);
    setImprovedText("");
    try {
      const input: ImproveTextInput = { text: inputText };
      const result = await improveText(input);
      setImprovedText(result.improvedText);
    } catch (error) {
      console.error("Error improving text:", error);
      toast({
        variant: "destructive",
        title: "AI Assistant Error",
        description: "Could not get suggestions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <Wand2 className="h-6 w-6 text-primary" />
          AI Content Assistant
        </CardTitle>
        <CardDescription>
          Need help wording your announcements or offers? Paste your text below and let our AI suggest improvements for clarity and engagement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="original-text" className="font-medium">Your Text</label>
            <Textarea
              id="original-text"
              placeholder="e.g., Helmets mandatory"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
             <label htmlFor="improved-text" className="font-medium">Suggested Improvement</label>
            <Textarea
              id="improved-text"
              placeholder="AI suggestions will appear here..."
              value={improvedText}
              readOnly
              rows={5}
              className="bg-muted/50 resize-none"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleImproveText} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Improving...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Improve Text
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
