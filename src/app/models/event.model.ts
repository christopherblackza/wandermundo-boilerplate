export interface MyEvent {
    id?: string;
    name: string;
    date: Date;
    time: string;
    image_url?: string;
    title?: string;
    location?: string;
    max_participants?: number;
    description: string;
    created_by: string;
  }