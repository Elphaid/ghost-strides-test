import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote, Heart, Book, RefreshCw } from 'lucide-react';

interface Quote {
  text: string;
  author: string;
}

interface Prayer {
  title: string;
  content: string;
}

interface Verse {
  text: string;
  reference: string;
}

const quotes: Quote[] = [
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu"
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde"
  },
  {
    text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    author: "Albert Einstein"
  }
];

const prayers: Prayer[] = [
  {
    title: "Morning Strength",
    content: "Lord, grant me strength for today's challenges. Help me to be productive, focused, and kind to others. Guide my decisions and bless my efforts."
  },
  {
    title: "Wisdom and Clarity",
    content: "Heavenly Father, give me wisdom to make good choices today. Clear my mind of distractions and help me prioritize what truly matters."
  },
  {
    title: "Gratitude and Joy",
    content: "Thank you, God, for this new day and all the opportunities it brings. Fill my heart with gratitude and help me spread joy to those around me."
  },
  {
    title: "Peace and Purpose",
    content: "Lord, calm my anxious thoughts and fill me with your peace. Help me remember my purpose and walk confidently in your plans for my life."
  },
  {
    title: "Strength in Difficulty",
    content: "God, when I face challenges today, remind me that you are with me. Give me courage to persevere and trust in your perfect timing."
  }
];

const verses: Verse[] = [
  {
    text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
    reference: "Jeremiah 29:11"
  },
  {
    text: "I can do all things through Christ who strengthens me.",
    reference: "Philippians 4:13"
  },
  {
    text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    reference: "Proverbs 3:5-6"
  },
  {
    text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    reference: "Joshua 1:9"
  },
  {
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    reference: "Romans 8:28"
  },
  {
    text: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7"
  },
  {
    text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.",
    reference: "Psalm 23:1-3"
  }
];

export const DailyInspirationCard = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote>(quotes[0]);
  const [currentPrayer, setCurrentPrayer] = useState<Prayer>(prayers[0]);
  const [currentVerse, setCurrentVerse] = useState<Verse>(verses[0]);

  // Get daily items based on date to ensure consistency throughout the day
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    
    setCurrentQuote(quotes[dayOfYear % quotes.length]);
    setCurrentPrayer(prayers[dayOfYear % prayers.length]);
    setCurrentVerse(verses[dayOfYear % verses.length]);
  }, []);

  const shuffleContent = () => {
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setCurrentPrayer(prayers[Math.floor(Math.random() * prayers.length)]);
    setCurrentVerse(verses[Math.floor(Math.random() * verses.length)]);
  };

  return (
    <div className="space-y-4">
      {/* Header with shuffle button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Daily Inspiration</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={shuffleContent}
          className="h-8 w-8 p-0 hover:rotate-180 transition-transform duration-300"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Quote Card */}
      <Card className="ghost-card">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Quote className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm italic mb-2">"{currentQuote.text}"</p>
              <p className="text-xs text-muted-foreground">— {currentQuote.author}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prayer Card */}
      <Card className="ghost-card">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium mb-2">{currentPrayer.title}</h4>
              <p className="text-sm text-muted-foreground">{currentPrayer.content}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bible Verse Card */}
      <Card className="ghost-card">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Book className="h-5 w-5 text-warning mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm mb-2">"{currentVerse.text}"</p>
              <p className="text-xs text-muted-foreground font-medium">{currentVerse.reference}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};