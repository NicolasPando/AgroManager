import { Controller, Get, Param, ParseUUIDPipe, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UUID } from "crypto";
import { Response } from 'express';
import mercadopago, { MercadoPagoConfig, PreApproval, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: 'APP_USR-8872127632320015-073117-44c82f425496d87fef92fc5bad1f0552-1490519917' });

@ApiTags("payment")
@Controller('payment')
export class PaymentController {
    @Get("monthly/:id")
    async suscripcionMensual(@Param("id", ParseUUIDPipe) id: UUID) {
        const body = {
            reason: "suscripcion mensual agromanager",
            auto_recurring: {
                frequency: 1,
                frequency_type: "days",
                transaction_amount: 1,
                currency_id: "ARS",
                start_date: new Date().toISOString(),
                end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
            },
            back_url: `https://deppf.onrender.com/users/premium/monthly/${id}`
        };

        const preapproval = new PreApproval(client);
        const result = await preapproval.create({ body });
        return result.init_point;
    }

    @Get("yearly/:id")
    async suscripcionAnual(@Param("id", ParseUUIDPipe) id: UUID) {
        const body = {
            items: [{
                id: '6789', 
                title: "suscripcion anual agromanager",
                quantity: 1,
                unit_price: 2,
                currency_id: "ARS"
            }],
            back_urls: {
                success: `https://deppf.onrender.com/users/premium/yearly/${id}`,
                failure: "https://music.youtube.com/watch?v=jtXDIfWjMkQ",
                pending: "https://www.youtube.com/watch?v=vEXwN9-tKcs",
            },
            auto_return: "approved"
        };

        const preference = new Preference(client);
        const result = await preference.create({ body });
        return result.init_point;
    }
}
