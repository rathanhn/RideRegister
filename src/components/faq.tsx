import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "Is there a registration fee?",
    answer: "No, the registration for the Independence Day Freedom Ride is completely free of charge.",
  },
  {
    question: "Who can participate in the ride?",
    answer: "The ride is open to everyone who is at least 18 years old and has a bicycle in good working condition.",
  },
  {
    question: "Is a helmet mandatory?",
    answer: "Yes, for safety reasons, a helmet is compulsory for all riders. Participants without a helmet will not be allowed to ride.",
  },
  {
    question: "What is the total distance of the ride?",
    answer: "The approximate distance is around 15-20 kilometers. The final route map will be shared on the day of the event.",
  },
  {
    question: "Will refreshments be provided?",
    answer: "Yes, light refreshments and water will be available at the mid-point break and at the conclusion of the ride.",
  },
]

export function Faq() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <HelpCircle className="h-6 w-6 text-primary" />
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-muted-foreground mt-1">{faq.answer}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
