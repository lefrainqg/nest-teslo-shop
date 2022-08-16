import { Injectable } from '@nestjs/common';

import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

   constructor(private readonly productsService: ProductsService) { }

   async runSeed() {
      this.insertNewProducts();
      return 'SEED EXECUTED';
   }

   private async insertNewProducts() {
      await this.productsService.deleteAllProducts();

      const products = initialData.products;
      const lstPromises = [];

      products.forEach(product => {
         lstPromises.push(this.productsService.create(product));
      })

      await Promise.all(lstPromises);

      return true;
   }

}
