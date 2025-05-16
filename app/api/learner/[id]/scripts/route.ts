import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Hard-coded list of scripts for now
  const scripts = [
    {
      id: "1",
      text: "Want to go to the park",
      meanings: [
        { id: "1", text: "I want to go to the park", context: "When looking out the window" },
        { id: "2", text: "Can we go to the park?", context: "When bored at home" },
      ],
      dateAdded: "2023-05-10T10:30:00Z",
    },
    {
      id: "2",
      text: "More juice please",
      meanings: [
        { id: "1", text: "I would like more juice", context: "During meal times" },
        { id: "2", text: "I am thirsty", context: "When playing" },
      ],
      dateAdded: "2023-05-12T14:20:00Z",
    },
    {
      id: "3",
      text: "Let it go, let it go",
      meanings: [
        { id: "1", text: "I want to watch Frozen", context: "When near the TV" },
        { id: "2", text: "I am feeling overwhelmed", context: "During stressful situations" },
      ],
      dateAdded: "2023-05-15T09:45:00Z",
    },
    {
      id: "4",
      text: "To infinity and beyond",
      meanings: [
        { id: "1", text: "I want to play with my Buzz Lightyear toy", context: "When in playroom" },
        { id: "2", text: "I want to watch Toy Story", context: "When looking at the TV" },
      ],
      dateAdded: "2023-05-18T16:10:00Z",
    },
    {
      id: "5",
      text: "Not feeling good",
      meanings: [
        { id: "1", text: "I am sick or in pain", context: "When touching stomach or head" },
        { id: "2", text: "I am tired", context: "When rubbing eyes" },
      ],
      dateAdded: "2023-05-20T11:30:00Z",
    },
  ]

  return NextResponse.json(scripts)
}
