import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Url {

    @PrimaryColumn({ unique: true })
    id: string;

    @Column()
    url: string;

    @Column()
    data: string;

}
