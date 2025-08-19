-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create months table for tracking periods
CREATE TABLE public.months (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID REFERENCES public.months(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('habit', 'daily', 'weekly', 'project')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  category TEXT NOT NULL CHECK (category IN ('health', 'study', 'finance', 'creative', 'personal', 'work', 'other')) DEFAULT 'other',
  deadline DATE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'achieved', 'not_achieved')) DEFAULT 'pending',
  reason TEXT,
  notes TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_entries table for daily tracking
CREATE TABLE public.daily_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES public.months(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Daily tracking fields
  wakeup_5am BOOLEAN DEFAULT FALSE,
  html_study BOOLEAN DEFAULT FALSE,
  html_study_topics TEXT[], -- Array of completed topics
  work_block BOOLEAN DEFAULT FALSE,
  
  -- Progress calculation
  completion_percentage DECIMAL(5,2) DEFAULT 0.0,
  achieved BOOLEAN DEFAULT FALSE,
  reason TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, date)
);

-- Create health_metrics table
CREATE TABLE public.health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2), -- in kg
  calories INTEGER,
  water_ml INTEGER,
  meals INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, date)
);

-- Create savings table
CREATE TABLE public.savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  time_recorded TIME,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create design_portfolio table
CREATE TABLE public.design_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  tool TEXT,
  file_url TEXT,
  external_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reflections table
CREATE TABLE public.reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly')),
  date DATE NOT NULL,
  content TEXT,
  wins TEXT,
  challenges TEXT,
  prayer_verse TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, type, date)
);

-- Create html_curriculum table for tracking study progress
CREATE TABLE public.html_curriculum (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, topic)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.html_curriculum ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data access
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own months" ON public.months FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own daily entries" ON public.daily_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own health metrics" ON public.health_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own savings" ON public.savings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own design portfolio" ON public.design_portfolio FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own reflections" ON public.reflections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own html curriculum" ON public.html_curriculum FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_months_updated_at BEFORE UPDATE ON public.months FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON public.daily_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_health_metrics_updated_at BEFORE UPDATE ON public.health_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_savings_updated_at BEFORE UPDATE ON public.savings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_design_portfolio_updated_at BEFORE UPDATE ON public.design_portfolio FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reflections_updated_at BEFORE UPDATE ON public.reflections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_html_curriculum_updated_at BEFORE UPDATE ON public.html_curriculum FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
    
    -- Insert default HTML curriculum topics
    INSERT INTO public.html_curriculum (user_id, topic) VALUES
        (NEW.id, 'HTML Basics & Structure'),
        (NEW.id, 'HTML Elements & Attributes'),
        (NEW.id, 'Forms & Input Types'),
        (NEW.id, 'HTML5 Semantic Elements'),
        (NEW.id, 'Tables & Lists'),
        (NEW.id, 'Links & Navigation'),
        (NEW.id, 'Media Elements (Images, Audio, Video)'),
        (NEW.id, 'HTML Best Practices'),
        (NEW.id, 'Accessibility in HTML'),
        (NEW.id, 'HTML Meta Tags & SEO');
        
    RETURN NEW;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();