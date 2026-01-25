'use client';

import { useState, useEffect, useCallback } from 'react';

interface Quote {
  text: string;
  author: string;
  role: string;
}

const quotes: Quote[] = [
  // Scientists
  {
    text: "The important thing is not to stop questioning. Curiosity has its own reason for existing.",
    author: "Albert Einstein",
    role: "Theoretical Physicist"
  },
  {
    text: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    author: "Marie Curie",
    role: "Physicist & Chemist"
  },
  {
    text: "The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself.",
    author: "Carl Sagan",
    role: "Astronomer & Science Communicator"
  },
  {
    text: "Success is to be measured not so much by the position that one has reached in life as by the obstacles which he has overcome.",
    author: "Booker T. Washington",
    role: "Educator & Author"
  },
  
  // Civil Rights Leaders
  {
    text: "The time is always right to do what is right.",
    author: "Dr. Martin Luther King Jr.",
    role: "Civil Rights Leader"
  },
  {
    text: "I have learned over the years that when one's mind is made up, this diminishes fear.",
    author: "Rosa Parks",
    role: "Civil Rights Activist"
  },
  {
    text: "If you don't like something, change it. If you can't change it, change your attitude.",
    author: "Maya Angelou",
    role: "Poet & Civil Rights Activist"
  },
  {
    text: "Have a vision. Be demanding.",
    author: "Colin Powell",
    role: "Statesman & General"
  },
  {
    text: "Service is the rent we pay for being. It is the very purpose of life, and not something you do in your spare time.",
    author: "Marian Wright Edelman",
    role: "Children's Rights Activist"
  },
  
  // Scholars & Philosophers
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    role: "Anti-Apartheid Revolutionary & President"
  },
  {
    text: "The function of education is to teach one to think intensively and to think critically.",
    author: "Dr. Martin Luther King Jr.",
    role: "Civil Rights Leader"
  },
  {
    text: "When you educate one person you can change a life, when you educate many you can change the world.",
    author: "Shai Reshef",
    role: "Educational Entrepreneur"
  },
  
  // Religious & Spiritual Leaders
  {
    text: "Be the change that you wish to see in the world.",
    author: "Mahatma Gandhi",
    role: "Spiritual & Political Leader"
  },
  {
    text: "If you want others to be happy, practice compassion. If you want to be happy, practice compassion.",
    author: "Dalai Lama",
    role: "Spiritual Leader"
  },
  {
    text: "Faith is taking the first step even when you don't see the whole staircase.",
    author: "Dr. Martin Luther King Jr.",
    role: "Minister & Civil Rights Leader"
  },
  {
    text: "We need to find God, and he cannot be found in noise and restlessness. God is the friend of silence.",
    author: "Mother Teresa",
    role: "Humanitarian & Saint"
  },
  
  // BIPOC Authors & Poets
  {
    text: "There is no greater agony than bearing an untold story inside you.",
    author: "Maya Angelou",
    role: "Poet & Author"
  },
  {
    text: "You wanna fly, you got to give up the shit that weighs you down.",
    author: "Toni Morrison",
    role: "Nobel Laureate Author"
  },
  {
    text: "If there's a book that you want to read, but it hasn't been written yet, then you must write it.",
    author: "Toni Morrison",
    role: "Nobel Laureate Author"
  },
  {
    text: "The most common way people give up their power is by thinking they don't have any.",
    author: "Alice Walker",
    role: "Pulitzer Prize Author"
  },
  {
    text: "I am not free while any woman is unfree, even when her shackles are very different from my own.",
    author: "Audre Lorde",
    role: "Poet & Activist"
  },
  {
    text: "Your silence will not protect you.",
    author: "Audre Lorde",
    role: "Writer & Civil Rights Activist"
  },
  {
    text: "Hold fast to dreams, for if dreams die, life is a broken-winged bird that cannot fly.",
    author: "Langston Hughes",
    role: "Poet & Social Activist"
  },
  {
    text: "I know why the caged bird sings.",
    author: "Maya Angelou",
    role: "Poet & Memoirist"
  },
  
  // Notable Thinkers & Leaders
  {
    text: "A person who never made a mistake never tried anything new.",
    author: "Albert Einstein",
    role: "Theoretical Physicist"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    role: "Technology Visionary"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    role: "Philosopher"
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    role: "Philosopher & Poet"
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    role: "Theoretical Physicist"
  },
  {
    text: "You don't have to see the whole staircase, just take the first step.",
    author: "Dr. Martin Luther King Jr.",
    role: "Civil Rights Leader"
  },
  
  // Contemporary Voices
  {
    text: "Define success on your own terms, achieve it by your own rules, and build a life you're proud to live.",
    author: "Anne Sweeney",
    role: "Media Executive"
  },
  {
    text: "I am my best work—a series of road maps, reports, recipes, doodles, and prayers from the front lines.",
    author: "Audre Lorde",
    role: "Poet & Essayist"
  },
  {
    text: "Caring for myself is not self-indulgence, it is self-preservation, and that is an act of political warfare.",
    author: "Audre Lorde",
    role: "Writer & Activist"
  },
  {
    text: "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel.",
    author: "Maya Angelou",
    role: "Poet & Humanitarian"
  },
  {
    text: "Excellence is not a skill. It is an attitude.",
    author: "Ralph Marston",
    role: "Writer"
  },
  {
    text: "We realize the importance of our voices only when we are silenced.",
    author: "Malala Yousafzai",
    role: "Nobel Laureate & Activist"
  },
  {
    text: "One child, one teacher, one book, one pen can change the world.",
    author: "Malala Yousafzai",
    role: "Education Activist"
  },
  {
    text: "When the whole world is silent, even one voice becomes powerful.",
    author: "Malala Yousafzai",
    role: "Nobel Peace Prize Laureate"
  }
];

interface QuoteCyclerProps {
  className?: string;
}

export default function QuoteCycler({ className = '' }: QuoteCyclerProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [shuffledQuotes, setShuffledQuotes] = useState<Quote[]>([]);

  // Shuffle quotes on mount
  useEffect(() => {
    const shuffled = [...quotes].sort(() => Math.random() - 0.5);
    setShuffledQuotes(shuffled);
  }, []);

  const cycleQuote = useCallback(() => {
    // Fade out
    setIsVisible(false);
    
    // After fade out, change quote and fade in
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % shuffledQuotes.length);
      setIsVisible(true);
    }, 800); // 800ms for fade out animation
  }, [shuffledQuotes.length]);

  useEffect(() => {
    if (shuffledQuotes.length === 0) return;
    
    // Cycle quotes every 7 seconds
    const interval = setInterval(cycleQuote, 7000);
    return () => clearInterval(interval);
  }, [cycleQuote, shuffledQuotes.length]);

  if (shuffledQuotes.length === 0) return null;

  const currentQuote = shuffledQuotes[currentQuoteIndex];

  return (
    <div className={`quote-cycler ${className}`}>
      <div 
        className={`quote-content transition-all duration-500 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <blockquote className="text-lg font-light text-foreground leading-relaxed mb-4 italic">
          "{currentQuote.text}"
        </blockquote>
        <div className="quote-attribution">
          <p className="text-base text-gold font-semibold">
            — {currentQuote.author}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentQuote.role}
          </p>
        </div>
      </div>
    </div>
  );
}

