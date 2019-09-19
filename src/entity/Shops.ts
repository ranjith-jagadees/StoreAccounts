import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToMany} from "typeorm";
import { Length, IsEmail, IsDate } from "class-validator";
import { ShopCustomers } from "./ShopCustomers";

@Entity()
export class Shops {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column("bigint")
    mobile: number;

    @Column()
    pin: string;

    @Column()
    shopName: string;

    @Column()
    @IsEmail()
    emailId : string

    @Column()
    address: string;

    @Column()
    district: string;

    @Column()
    state: string;

    @Column()
    @Length(6)
    pincode: string;

    @Column()
    @IsDate()
    regDate: Date;

    @Column({default: false})
    isApproved: boolean;

    @Column({default: false})
    admin: boolean;

    @OneToMany(()=> ShopCustomers, shopCustomers=> shopCustomers.customers, {cascade: true})
    shop: ShopCustomers[];

}
