import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../../core/services/product.service';
import { Category, Product, ProductVariant } from '../../../../core/models/models';
import { ImageUploadComponent } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, ImageUploadComponent],
  template: `
    <div class="header-actions">
      <button mat-button routerLink=".."><mat-icon>arrow_back</mat-icon> Back to Products</button>
    </div>

    <div class="admin-header">
      <div class="header-titles">
        <h1>{{ isEditMode ? 'Edit Product' : 'Create New Product' }}</h1>
        <p>Fill in the details below</p>
      </div>
    </div>

    <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
      <div class="form-layout">
        <!-- Main Details -->
        <div class="main-col">
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Basic Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Product Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g. Wireless Headphones">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="5" placeholder="Detail the features and specs..."></textarea>
              </mat-form-field>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Base Price</mat-label>
                  <span matPrefix>&#8377; &nbsp;</span>
                  <input matInput type="number" formControlName="basePrice">
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="categoryId">
                    <mat-option *ngFor="let cat of categories" [value]="cat.id">
                      {{ cat.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Variants -->
          <mat-card class="form-card variants-card">
            <mat-card-header>
              <mat-card-title>Product Variants</mat-card-title>
              <button type="button" mat-stroked-button color="primary" (click)="addVariant()">
                <mat-icon>add</mat-icon> Add Variant
              </button>
            </mat-card-header>
            <mat-card-content formArrayName="variants">
              <div class="variant-item" *ngFor="let variant of variants.controls; let i=index" [formGroupName]="i">
                <div class="variant-header">
                  <h4>Variant #{{ i + 1 }}</h4>
                  <button type="button" mat-icon-button color="warn" (click)="removeVariant(i)" [disabled]="variants.length === 1">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
                
                <div class="form-row">
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Variant Name</mat-label>
                    <input matInput formControlName="name" placeholder="e.g. Red / 64GB">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>SKU</mat-label>
                    <input matInput formControlName="sku" placeholder="PRD-RED-64">
                  </mat-form-field>
                  
                  <div class="form-row third-width" style="gap: 8px">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Price</mat-label>
                      <input matInput type="number" formControlName="price">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Stock</mat-label>
                      <input matInput type="number" formControlName="stockQuantity">
                    </mat-form-field>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Sidebar / Images -->
        <div class="side-col">
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Thumbnail Image</mat-card-title>
            </mat-card-header>
            <mat-card-content class="img-content">
              <app-image-upload [previewUrl]="productForm.get('thumbnailUrl')?.value"
                                (imageUploaded)="onThumbnailUploaded($event)"
                                (imageRemoved)="onThumbnailRemoved()">
              </app-image-upload>
            </mat-card-content>
          </mat-card>

          <!-- Extra Images -->
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Additional Product Images</mat-card-title>
            </mat-card-header>
            <mat-card-content class="img-content">
              <div class="extra-images-list" *ngIf="imageUrls.length > 0">
                <div class="extra-image-box" *ngFor="let control of imageUrls.controls; let i=index">
                  <img [src]="control.value" alt="extra image" />
                  <button type="button" mat-icon-button color="warn" class="remove-img-btn" (click)="removeExtraImage(i)">
                     <mat-icon>close</mat-icon>
                  </button>
                </div>
              </div>
              <p style="color: #616161; font-size: 14px; margin: 12px 0;">Upload more images for the product carousel.</p>
              <app-image-upload (imageUploaded)="onExtraImageUploaded($event)">
              </app-image-upload>
            </mat-card-content>
          </mat-card>
          
          <!-- Product Status -->
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Publishing</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p style="color: #616161; font-size: 14px; margin-bottom: 24px;">By saving this product, it will immediately become available in the catalog based on stock levels.</p>
              
              <button mat-flat-button color="primary" type="submit" class="full-width save-btn" [disabled]="productForm.invalid || isSaving">
                <mat-icon>cloud_upload</mat-icon>
                {{ isSaving ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product') }}
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .header-actions { margin-bottom: 16px; margin-left: -16px; }
    .admin-header { margin-bottom: 24px; }
    .header-titles h1 { margin: 0 0 4px 0; font-size: 24px; font-weight: 500; }
    .header-titles p { margin: 0; color: #757575; }
    
    .form-layout { display: flex; gap: 24px; align-items: flex-start; }
    @media (max-width: 900px) { .form-layout { flex-direction: column; } }
    
    .main-col { flex: 2; display: flex; flex-direction: column; gap: 24px; }
    .side-col { flex: 1; display: flex; flex-direction: column; gap: 24px; width: 100%; }
    
    .form-card { padding: 16px; }
    .form-card mat-card-header { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 16px; }
    mat-card-title { font-size: 18px; margin: 0; }
    
    .full-width { width: 100%; margin-top: 8px; }
    .form-row { display: flex; gap: 16px; width: 100%; }
    .half-width { flex: 1; }
    .third-width { flex: 1 1 33%; }
    @media (max-width: 700px) { .form-row { flex-direction: column; gap: 0; } }
    
    .img-content { padding-top: 16px; }
    
    .variants-card mat-card-content { display: flex; flex-direction: column; gap: 16px; }
    .variant-item { border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; background: #fafafa; }
    .variant-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .variant-header h4 { margin: 0; color: #3f51b5; font-weight: 500; }
    
    .save-btn { padding: 8px 0; font-size: 16px; height: 50px; }

    .extra-images-list { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
    .extra-image-box { position: relative; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0; }
    .extra-image-box img { width: 100%; height: 100%; object-fit: cover; }
    .remove-img-btn { position: absolute; top: -8px; right: -8px; transform: scale(0.7); background: white; }
  `]
})
export class AdminProductFormComponent implements OnInit {
  fb = inject(FormBuilder);
  productService = inject(ProductService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  productForm: FormGroup;
  categories: Category[] = [];
  
  isEditMode = false;
  productId: number | null = null;
  isSaving = false;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required],
      thumbnailUrl: [''],
      variants: this.fb.array([]),
      imageUrls: this.fb.array([])
    });
  }

  get variants() {
    return this.productForm.get('variants') as FormArray;
  }

  get imageUrls() {
    return this.productForm.get('imageUrls') as FormArray;
  }

  ngOnInit() {
    this.productService.getCategories().subscribe(res => {
      if (res.success) this.categories = res.data;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.isEditMode = true;
        this.productId = Number(id);
        this.loadProduct(this.productId);
      } else {
        // Init one variant for new products
        this.addVariant();
      }
    });
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const product = res.data;
          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            basePrice: product.basePrice,
            categoryId: product.category?.id,
            thumbnailUrl: product.thumbnailUrl
          });

          if (product.variants) {
            this.variants.clear();
            product.variants.forEach((v: ProductVariant) => {
              this.variants.push(this.createVariantGroup(v));
            });
          }

          if (product.images) {
            this.imageUrls.clear();
            product.images.forEach((img: any) => {
              this.imageUrls.push(this.fb.control(img.imageUrl));
            });
          }
        }
      }
    });
  }

  createVariantGroup(variant?: any): FormGroup {
    return this.fb.group({
      id: [variant?.id || null],
      name: [variant?.name || '', Validators.required],
      sku: [variant?.sku || '', Validators.required],
      price: [variant?.price || 0, [Validators.required, Validators.min(0)]],
      stockQuantity: [variant?.stockQuantity || 0, [Validators.required, Validators.min(0)]]
    });
  }

  addVariant() {
    this.variants.push(this.createVariantGroup());
  }

  removeVariant(index: number) {
    this.variants.removeAt(index);
  }

  onThumbnailUploaded(url: string) {
    this.productForm.patchValue({ thumbnailUrl: url });
    this.productForm.markAsDirty();
  }

  onThumbnailRemoved() {
    this.productForm.patchValue({ thumbnailUrl: '' });
    this.productForm.markAsDirty();
  }

  onExtraImageUploaded(url: string) {
    this.imageUrls.push(this.fb.control(url));
    this.productForm.markAsDirty();
  }

  removeExtraImage(index: number) {
    this.imageUrls.removeAt(index);
    this.productForm.markAsDirty();
  }

  saveProduct() {
    if (this.productForm.invalid) return;
    
    this.isSaving = true;
    const req$ = this.isEditMode && this.productId
      ? this.productService.updateProduct(this.productId, this.productForm.value)
      : this.productService.createProduct(this.productForm.value);

    req$.subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.success) {
          this.snackBar.open(`Product ${this.isEditMode ? 'updated' : 'created'} successfully`, 'Close', { duration: 3000 });
          this.router.navigate(['/admin/products']);
        }
      },
      error: () => this.isSaving = false
    });
  }
}
