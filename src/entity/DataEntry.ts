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

    @Column({nullable:true})
    date: Date;

    @Column({nullable:true})
    dateofentry: Date;

    @ManyToOne(()=>ShopCustomers, shopCustomers=>shopCustomers, {cascade:true})
    @JoinColumn()
    datas: ShopCustomers;

}