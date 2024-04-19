import { FormaPagamento } from "@modules/types/FormaPagamento";

class Pedidos {
    formaPagamento: FormaPagamento;
    dataEntrega: Date;
    valorTotal: number;
    quantidadeItens: number;
}