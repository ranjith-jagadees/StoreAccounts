import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column, Double, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IsInt, Length } from "class-validator";
import { Shops } from "./Shops";
import { DataEntry } from "./DataEntry";

@Entity()
export class ShopCustomers{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    cusNo: number;

    @Column()
    CusName : string;

    @Column()
    @Length(10)
    MobileNum: string;

    @Column("double")
    Outstanding: number

    @ManyToOne(()=> Shops, shops=> shops.shop)
    @JoinColumn()
    customers : Shops;

    @OneToMany(()=>DataEntry, dataEntry=> dataEntry.datas, {cascade:true})
    customer: DataEntry[];
}