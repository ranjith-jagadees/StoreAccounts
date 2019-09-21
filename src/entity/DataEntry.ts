import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ShopCustomers } from "./ShopCustomers";

@Entity()
export class DataEntry{

    @PrimaryGeneratedColumn()
    sno: number;

    @Column("double")
    outstanding: number;

    @Column({nullable:true})
    message: string;

    @Column("double", {nullable: true})
    amount: number;

    @Column({nullable:true})
    credibit: string;

    @Column()
    date: Date;

    @Column()
    dateofentry: Date;

    @ManyToOne(()=>ShopCustomers, shopCustomers=>shopCustomers)
    @JoinColumn()
    datas: ShopCustomers;

}