import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

   @IsString()
   @MinLength(1)
   title: string;

   @IsNumber()
   @IsPositive()
   @IsOptional()
   price?: number;

   @IsString()
   @IsOptional()
   descripcion?: string;

   @IsString()
   @IsOptional()
   slug?: string;

   @IsInt()
   @IsPositive()
   @IsOptional()
   stock?: number;

   @IsString({ each: true }) //cada item debe cumplir con ser string
   @IsArray()
   sizes: string[];

   @IsIn(['men', 'women', 'kid', 'unisex'])
   gender: string;

   @IsString({ each: true }) //cada item debe cumplir con ser string
   @IsArray()
   @IsOptional()
   tags: string[];

   @IsString({ each: true })
   @IsArray()
   @IsOptional()
   images?: string[];

}
