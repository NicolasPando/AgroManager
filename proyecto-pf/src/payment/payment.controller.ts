import { Controller, Get, Param, ParseUUIDPipe, Res, HttpStatus } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UUID } from "crypto";
import { Response } from 'express';
import mercadopago, { MercadoPagoConfig, PreApproval, Preference } from 'mercadopago';

// Configura el cliente con el access token
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-8872127632320015-073117-44c82f425496d87fef92fc5bad1f0552-1490519917' });

@ApiTags("payment")
@Controller('payment')
export class PaymentController {
    @Get("monthly/:id")
    async suscripcionMensual(@Param("id", ParseUUIDPipe) id: UUID, @Res() res: Response) {
        try {
            // Define el cuerpo de la solicitud de preaprobación
            const body = {
                reason: "suscripcion diaria agromanager",
                auto_recurring: {
                    frequency: 1,
                    frequency_type: "days",
                    transaction_amount: 15,
                    currency_id: "ARS",
                    start_date: new Date().toISOString(),
                    end_date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString() // Ajustar a 1 día
                },
                back_url: `https://deppf.onrender.com/users/premium/monthly/${id}`,
                payer_email: "carinadcundins@gmail.com"
            };

            // Inicializa la preaprobación con el cliente
            const preapproval = new PreApproval(client);
            
            // Crea la preaprobación
            const result = await preapproval.create({ body });
            
            // Retorna el punto de inicio de la preaprobación
            return res.status(HttpStatus.OK).json({ url: result.init_point });
        } catch (error) {
            console.error('Error creating monthly subscription:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error: error.message });
        }
    }

    @Get("yearly/:id")
    async suscripcionAnual(@Param("id", ParseUUIDPipe) id: UUID, @Res() res: Response) {
        try {
            // Define el cuerpo de la solicitud de preferencia
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

            // Inicializa la preferencia con el cliente
            const preference = new Preference(client);
            
            // Crea la preferencia
            const result = await preference.create({ body });
            
            // Retorna el punto de inicio de la preferencia
            return res.status(HttpStatus.OK).json({ url: result.init_point });
        } catch (error) {
            console.error('Error creating yearly subscription:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error', error: error.message });
        }
    }
}
