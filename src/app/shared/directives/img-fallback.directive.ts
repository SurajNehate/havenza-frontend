import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true
})
export class ImgFallbackDirective {
  @Input() appImgFallback: string = '';

  private readonly defaultPlaceholder = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjlGOUY5Ii8+CjxwYXRoIGQ9Ik0zMzIgMTY4SDIxNkMyMDcuMTYzIDIxNiAyMDAgMjIzLjE2MyAyMDAgMjMyVjM0OEMyMDAgMzU2LjgzNyAyMDcuMTYzIDM2NCAyMTYgMzY0SDMzMkMzNDAuODM3IDM2NCAzNDggMzU2LjgzNyAzNDggMzQ4VjIzMkMzNDggMjIzLjE2MyAzNDAuODM3IDIxNiAzMzIgMjE2WiIgc3Ryb2tlPSIjREQ0QjVGIiBzdHJva2Utd2lkdGg9IjI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTI2OCA0NDBMNDQgNDQwTDMwMCAxODRMMTU2IDQ0MCIgc3Ryb2tlPSIjREQ0QjVGIiBzdHJva2Utd2lkdGg9IjhCIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHN0eWxlPnBhdGgsIHJlY3Qge29wYWNpdHk6IDAuMTt9PC9zdHlsZT4KPGcgb3BhY2l0eT0iMC4yIj4KPGNpcmNsZSBjeD0iMjUwIiBjeT0iMjUwIiByPSIxMjAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iOCAyIi8+CjxtYXRvci1pY29uIHN0eWxlPSJmb250LXNpemU6IDQ4cHg7IGNvbG9yOiAjOTk5OyBtYXJnaW46IDBhdXRvOyI+aW1hZ2Vfbm90X3N1cHBvcnRlZDwvbWF0b3ItaWNvbj4KPC9nPgo8L3N2Zz4=`;

  constructor(private el: ElementRef) {}

  @HostListener('error')
  onError() {
    const element: HTMLImageElement = this.el.nativeElement;
    element.src = this.appImgFallback || this.defaultPlaceholder;
    
    // Add a class for styling fallback state if needed
    element.classList.add('img-fallback-active');
    
    // Optional: add a subtle border or background to the element
    element.style.backgroundColor = '#f5f5f5';
    element.style.objectFit = 'contain';
  }
}
