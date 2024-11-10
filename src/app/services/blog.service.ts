import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  author: string;
  authorImage: string;
  authorBio: string;
  tags: string[];
  readTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Getting around Cape Town',
      content: `
          <h2>Events Happening Every Week</h2>

<ul>
    <li><strong>Every Day -</strong> Karioke Nights at Bokeh</li>
    <li><strong>Every Monday -</strong>
        <ul>
            <li>Stroll at 17:45 for 18:00 meet at The Deck Sea Point</li>
            <li>Karioke at Mojo Market</li>
        </ul>
    </li>
    <li><strong>Every Tuesday -</strong>
        <ul>
            <li>Jam Night @Gorgeous George Hotel 7-10pm</li>
            <li>Open mic Singers/Songwriting @House of Machines</li>
            <li>CareCruisers Volunteering Feeding Homeless People meet at 155 Loop Street</li>
            <li>Jam Session @A Touch of Madness in Obs open mic night</li>
        </ul>
    </li>
    <li><strong>Every Wednesday -</strong>
        <ul>
            <li>Running Late Club meet at The Deck Sea Point</li>
            <li>Open Mic Night (Touch of Madness Obs)</li>
        </ul>
    </li>
    <li><strong>Every Thursday -</strong></li>
    <li><strong>Every Friday -</strong> BBQ Nights at Villa Viva Hostel Starting from 19:00, Social Cardio Tennis 17:00</li>
    <li><strong>Every Saturday -</strong> Orangezicht Market</li>
    <li><strong>Every Sunday -</strong>
        <ul>
            <li>Orangezicht Market</li>
            <li>Mojo Market Salsa Beginners at 20:00</li>
            <li>Arm Chair Comedy</li>
        </ul>
    </li>
</ul>

<h2>Night life Options</h2>

<ul>
    <li><strong>House Of Machines</strong> - Location: 84 Shortmarket St</li>
    <li><strong>Gorgeous George Hotel</strong> - Location: 118 St Georges Mall, Cape Town City Centre</li>
    <li><strong>Tommy Chop Shop</strong> - Location: 50 Canterbury St, District Six</li>
    <li><strong>Touch of Madness</strong> - Location: 12 Nuttall Rd, Observatory</li>
    <li><strong>Surfa Rosa</strong> - Location: 61a Harrington St, District Six, Cape Town>Location</a></li>
    <li><strong>Athletic Social Club</strong> - Location: 35 Buitengracht St, CBD</li>
    <li><strong>Tiki Tomb</strong> - Location: 107A Bree St, Cape Town</li>
    <li><strong>Arm Chair Theatre Obs</strong> - Location: 135 Lower Main Rd, Observatory</li>
    <li><strong>Modular</strong> - Location: Riebeek St, Cape Town City Centre</li>
    <li><strong>Zsa Zsa</strong> - Location: 101 Hout St, CBD</li>
    <li><strong>Asoka</strong> - Location: 68 Kloof St, Gardens</li>
    <li><strong>Village Idiot</strong> - Location: 32 Loop St, CBD, Cape Town, 8001</li>
    <li><strong>Barcadia</strong> - Location: 62 Hout St, Cape Town City Centre</li>
    <li><strong>Secret Gin Bar</strong> - Location: 64A Wale St, Cape Town City Centre</li>
</ul>

<h2>Hiking Options</h2>

<ul>
    <li>Kloof Corner Sunset Hike, 1.9 km</li>
    <li>Cederberg Home Stay De Pahk Huis (12 People <strong>Klipspringer</strong>)</li>
    <li>Cederberg Wolfarch</li>
    <li>Lions Head</li>
    <li>Pipe Track</li>
    <li>India Venster</li>
</ul>

<h2>Co-Working Cafes</h2>

<ul>
    <li>Red Sofa Cafe & Deli (Coffee Shop) - Vredehoek</li>
    <li>Pizzasaurus (Restaurant) - District 6</li>
    <li>The Peninsula All-Suite Hotel</li>
    <li>Bootleggers Coffee (Sea Point)</li>
    <li>Jooma Coffee (Sea Point)</li>
    <li>Neighborgood Cape Quarter</li>
    <li>Strangers Club (Green Point)</li>
</ul>    

<h2>Whatsapp Communities</h2>
<ul>
    <li>Social Club <a href="https://chat.whatsapp.com/KjcImkHac327nMjPZsxN9W" target="_blank">Link</a></li>
    <li>Nomad Gig Guide <a href="https://linktr.ee/nomadgigguide" target="_blank">Link</a></li>
    <li>Cliffed Out <a href="https://chat.whatsapp.com/BrGcfbsak3IATwhAxpF3S8" target="_blank">Link</a></li>
    <li>Cape Town Nomads <a href="https://chat.whatsapp.com/KWoZi2UDfMW4eKP2xw3wX9" target="_blank">Link</a></li>
    <li>Work Wonderers <a href="https://chat.whatsapp.com/C4XOTq4vOTFDOOcm48Kk4y" target="_blank">Link</a></li>
    <li>Lekker Social Community <a href="https://chat.whatsapp.com/EcYZu8H4YIn67h3r4IqRxq" target="_blank">Link</a></li>
</ul>



      `,
      excerpt: 'Everything you need to know about getting around Cape Town as a digital nomad as well as my favorite places to visit.',
      image: 'assets/images/blog/chris-blog-cover.jpeg',
      date: '2024-011-09',
      category: 'Guide & Recommendationss',
      author: 'Christopher Black',
      authorImage: 'assets/images/christopher.jpeg',
      authorBio: 'Christopher is a seasoned digital nomad with 2 years of experience traveling while working remotely.',
      tags: ['Digital Nomad', 'Remote Work', 'Travel Tips', 'Lifestyle'],
      readTime: 8
    },
    // {
    //   id: '2',
    //   title: '10 Best Cities for Digital Nomads in 2024',
    //   content: `<p>Choosing the right city as a digital nomad can make or break your experience...</p>`,
    //   excerpt: 'Discover the top destinations for remote workers, featuring fast internet, affordable living, and vibrant communities.',
    //   image: 'assets/blog/best-cities.jpg',
    //   date: '2024-03-10',
    //   category: 'Destinations',
    //   author: 'Mike Wilson',
    //   authorImage: 'assets/authors/mike.jpg',
    //   authorBio: 'Travel writer and digital nomad enthusiast with a passion for exploring emerging tech hubs.',
    //   tags: ['Travel', 'Cities', 'Digital Nomad'],
    //   readTime: 6
    // },
    // {
    //   id: '3',
    //   title: 'How to Stay Productive While Traveling',
    //   content: `
    //     <p>Maintaining productivity while on the road can be challenging, but with the right strategies, it's entirely possible.</p>
        
    //     <h2>Set a Routine</h2>
    //     <p>Having a consistent routine helps you stay focused and manage your time effectively. Try to wake up and start work at the same time each day.</p>
        
    //     <h2>Find a Good Workspace</h2>
    //     <p>Look for coworking spaces or cafes with reliable internet and a comfortable atmosphere. Avoid working from your bed or couch to maintain a clear boundary between work and relaxation.</p>
        
    //     <h2>Use Productivity Tools</h2>
    //     <p>There are numerous apps and tools designed to boost productivity. Some popular options include:</p>
    //     <ul>
    //       <li>Trello for task management</li>
    //       <li>Slack for communication</li>
    //       <li>Focus@Will for concentration music</li>
    //     </ul>`,
    //   excerpt: 'Learn how to stay productive and manage your time effectively while traveling as a digital nomad.',
    //   image: 'assets/blog/productivity-tips.jpg',
    //   date: '2024-03-20',
    //   category: 'Productivity',
    //   author: 'Emily Davis',
    //   authorImage: 'assets/authors/emily.jpg',
    //   authorBio: 'Emily is a productivity coach and digital nomad who helps remote workers optimize their workflows.',
    //   tags: ['Productivity', 'Remote Work', 'Travel Tips'],
    //   readTime: 5
    // }
  ];

  constructor() { }

  getAllPosts(): Observable<BlogPost[]> {
    return of(this.blogPosts).pipe(delay(800)); // Simulate network delay
  }

  getPostById(id: string): Observable<BlogPost> {
    const post = this.blogPosts.find(post => post.id === id);
    if (post) {
      return of(post).pipe(delay(800)); // Simulate network delay
    }
    return throwError(() => new Error('Post not found'));
  }

  getRelatedPosts(currentPostId: string, limit: number = 3): Observable<BlogPost[]> {
    const relatedPosts = this.blogPosts
      .filter(post => post.id !== currentPostId)
      .slice(0, limit);
    return of(relatedPosts).pipe(delay(800));
  }

  getTrendingPosts(limit: number = 3): Observable<BlogPost[]> {
    return of(this.blogPosts.slice(0, limit)).pipe(delay(800));
  }
}