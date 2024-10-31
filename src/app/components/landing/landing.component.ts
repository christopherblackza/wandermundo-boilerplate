import { Component, HostListener, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterModule } from "@angular/router";
import { MembersComponent } from "../members/members.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { HomeComponent } from "../home/home.component";

@Component({
  selector: "app-landing",
  standalone: true,
  imports: [CommonModule, RouterModule, MembersComponent, RouterLink, NavbarComponent, HomeComponent],
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.scss"],
})
export class LandingComponent implements OnInit {
  testimonials = [
    {
      text: "I've met the most amazing people and had unforgettable experiences thanks to WanderMundo.",
      author: "Sarah T., Digital Nomad",
    },
    {
      text: "WanderMundo made it so easy to connect with like-minded travelers and explore new places.",
      author: "John D., Adventure Seeker",
    },
    {
      text: "The community events and activities are fantastic. I've made friends for life!",
      author: "Emma L., Solo Traveler",
    },
  ];
  currentTestimonialIndex = 0;

  isMenuOpen = false;
  isHeaderScrolled = false;

  ngOnInit() {
    setInterval(() => {
      this.currentTestimonialIndex =
        (this.currentTestimonialIndex + 1) % this.testimonials.length;
    }, 5000);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Adjust this value to match your header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  animateFeature(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    target.style.transform = "scale(1.05)";
    target.style.transition = "transform 0.3s ease-in-out";
  }

  resetFeature(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    target.style.transform = "scale(1)";
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.isHeaderScrolled = window.pageYOffset > 50;
  }
  
}
