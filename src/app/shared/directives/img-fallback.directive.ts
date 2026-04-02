import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true
})
export class ImgFallbackDirective {
  /**
   * Type of fallback to show: 'product' or 'user'. 
   * Alternatively, can be a direct URL string.
   */
  @Input() appImgFallback: 'product' | 'user' | string = 'product';

  private readonly productPlaceholder = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjlGOUY5Ii8+CjxwYXRoIGQ9Ik0zNTAgMTEwaDE1MHYzODBIMTEwVjExMGgxNTBtLTEwMCAxMDBoMjUwbS0yNTAgMTAwaDI1MG0tMjUwIDEwMGgyNTAiIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMiIvPgo8ZyBvcGFjaXR5PSIwLjQiPgo8cGF0aCBkPSJNMzUwIDE1MEgyMThDMTk3IDE1MCAxODAgMTY3IDE4MCAxODhWMzU4QzE4MCAzNzkgMTk3IDM5NiAyMTggMzk2SDM1OEMzODAgMzk2IDM5NiAzNzkgMzk2IDM1OFYxODhDMzk2IDE2NyAzODAgMTUwIDM1OCAxNTBaIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMTYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8Y2lyY2xlIGN4PSIyODgiIGN5PSIyNTAiIHI9IjQwIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iOCIvPgo8L2c+Cjwvc3ZnPg==`;

  private readonly userPlaceholder = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjlGOUY5Ii8+CjxyZWN0IHg9IjE1MCIgeT0iMTUwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcng9IjEwMCIgZmlsbD0iI2VlZSIvPgo8ZyBvcGFjaXR5PSIwLjQiPgo8Y2lyY2xlIGN4PSIyNTAiIGN5PSIxOTAiIHI9IjYwIiBmaWxsPSIjOTk5Ii8+CjxwYXRoIGQ9Ik0xNTAgMzgwQzE1MCAzMjAgMjAwIDI4MCAyNTAgMjgwQzMwMCAyODAgMzUwIDMyMCAzNTAgMzgwIiBmaWxsPSIjOTk5Ii8+CjwvZz4KPC9zdmc+`;

  constructor(private el: ElementRef) {}

  @HostListener('error')
  onError() {
    const element: HTMLImageElement = this.el.nativeElement;
    
    if (this.appImgFallback === 'user') {
      element.src = this.userPlaceholder;
    } else if (this.appImgFallback === 'product' || !this.appImgFallback) {
      element.src = this.productPlaceholder;
    } else {
      element.src = this.appImgFallback;
    }
    
    element.classList.add('img-fallback-active');
    element.style.backgroundColor = '#f5f5f5';
    element.style.objectFit = 'contain';
  }
}
