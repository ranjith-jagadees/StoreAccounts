import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToMany} from "typeorm";
import { ShopCustomers } from "./ShopCustomers";

@Entity()
export class Shops {

    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    mobile: string;

    @Column()
    pin: string;

    @Column()
    shopName: string;

    @Column()
    emailId : string

    @Column()
    address: string;

    @Column()
    district: string;

    @Column()
    state: string;

    @Column()
    pincode: string;

    @Column()
    regDate: Date;

    @Column({default: false})
    isApproved: boolean;

    @Column({default: false})
    admin: boolean;

    @OneToMany(()=> ShopCustomers, shopCustomers=> shopCustomers.customers, {cascade: true})
    shop: ShopCustomers[];

}
