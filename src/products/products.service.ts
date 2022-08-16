import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid'

import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';


@Injectable()
export class ProductsService {

   private readonly logger = new Logger('ProductsServices');

   constructor(
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,

      @InjectRepository(ProductImage)
      private readonly productImageRepository: Repository<ProductImage>,

      private readonly dataSource: DataSource
   ) { }

   async create(createProductDto: CreateProductDto) {
      try {
         const { images = [], ...productDetails } = createProductDto; //operador rest -> resto de datos que no sean imagen asignad a productDetails
         const product = this.productRepository.create({
            ...productDetails, //operador express 
            images: images.map(img => this.productImageRepository.create({ url: img }))
         });
         await this.productRepository.save(product);
         // return product;
         return { ...product, images };
      } catch (error) {
         this.handleDBExceptions(error);
      }
   }

   async findAll(paginationDto: PaginationDto) {
      const { limit = 10, offset = 0 } = paginationDto;
      const products = await this.productRepository.find({
         take: limit,
         skip: offset,
         //TODO: Para cargar tambien datos de entidades relacionadas
         relations: {
            images: true
         }
      });

      return products.map(product => ({
         ...product,
         images: product.images.map(img => img.url)
      }))
   }

   async findOne(term: string) {
      let product: Product;
      if (isUUID(term)) {
         product = await await this.productRepository.findOneBy({ id: term });
      } else {
         const queryBuilder = this.productRepository.createQueryBuilder('prod') //prod alias;
         product = await queryBuilder
            .where(`UPPER(title) =:title or slug =:slug`, {
               title: term.toUpperCase(),
               slug: term.toLocaleLowerCase()
            })
            .leftJoinAndSelect('prod.images', 'prodImages')
            .getOne();
      }
      if (!product)
         throw new NotFoundException(`Product with term=${term}, not found`);
      return product;
   }

   async findOnePlain(term: string) {
      const { images = [], ...rest } = await this.findOne(term);
      return {
         ...rest,
         images: images.map(img => img.url)
      }
   }

   async update(id: string, updateProductDto: UpdateProductDto) {

      const { images, ...toUpdate } = updateProductDto;

      //Bucar por id, y carga los datos que recibe desde el controler en el objeto preparado para actualizar
      const product = await this.productRepository.preload({ id, ...toUpdate });

      if (!product) throw new NotFoundException(`Product with id:${id} not found`);

      //Create query runner
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {

         if (images) {
            await queryRunner.manager.delete(ProductImage, { product: { id } }); //todas las imagenes con id del producto (productId)
            product.images = images.map(img => this.productImageRepository.create({ url: img }))
         }

         await queryRunner.manager.save(product);
         // await this.productRepository.save(product);
         await queryRunner.commitTransaction();
         await queryRunner.release();

         return this.findOnePlain(id);
      } catch (error) {
         await queryRunner.rollbackTransaction();
         await queryRunner.release();

         this.handleDBExceptions(error);
      }
   }

   async remove(id: string) {
      const product = await this.findOne(id);
      await this.productRepository.remove(product);
   }

   private handleDBExceptions(error: any) {
      if (error.code === '23505')
         throw new BadRequestException(error.detail)
      this.logger.error(error);
      throw new InternalServerErrorException(`Unexpected error, check server log`);
   }

   //SOLO EN DESARROLLO
   async deleteAllProducts() {
      const query = this.productRepository.createQueryBuilder('product');
      try {
         return await query.delete().where({}).execute();
      } catch (error) {
         this.handleDBExceptions(error);
      }
   }

}
