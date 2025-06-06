"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import { CheckoutProgress } from "@/components/checkout/checkout-progress"
import { CartSummary } from "@/components/checkout/cart-summary"
import { ShippingForm } from "@/components/checkout/shipping-form"
import { PaymentForm } from "@/components/checkout/payment-form"
import { OrderConfirmation } from "@/components/checkout/order-confirmation"
import toast from "react-hot-toast"
import { useCart } from "@/hooks/use-cart"

const steps = ["Carrito", "Envío", "Pago", "Confirmación"]

// Validation functions
const validateShippingData = (data: {
	firstName: string
	lastName: string
	email: string
	phone: string
	address: string
	city: string
	state: string
	zipCode: string
	country: string
}) => {
	const required = [
		"firstName",
		"lastName",
		"email",
		"address",
		"city",
		"zipCode",
		"country",
	]
	const validationResults = {
		isValid: true,
		errors: {} as Record<string, string>,
	}

	required.forEach((field) => {
		const value = data[field as keyof typeof data]
		if (!value || (typeof value === "string" && value.trim() === "")) {
			validationResults.isValid = false
			validationResults.errors[field] = "Este campo es requerido"
		}
	})

	// Email validation
	if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
		validationResults.isValid = false
		validationResults.errors["email"] = "Email inválido"
	}

	// Zip code validation - assuming Colombian format (6 digits)
	if (data.zipCode && !/^\d{5,6}$/.test(data.zipCode)) {
		validationResults.isValid = false
		validationResults.errors["zipCode"] = "Código postal inválido"
	}

	return validationResults
}

const validatePaymentData = (data: {
	method: "card" | "mercadopago" | "bank"
	cardNumber: string
	expiryDate: string
	cvv: string
	cardName: string
}) => {
	const validationResults = {
		isValid: true,
		errors: {} as Record<string, string>,
	}

	if (data.method === "card") {
		// Card number validation (16 digits)
		if (!data.cardNumber || !/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ""))) {
			validationResults.isValid = false
			validationResults.errors["cardNumber"] = "Número de tarjeta inválido"
		}

		// Expiry date validation (MM/YY format)
		if (!data.expiryDate || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(data.expiryDate)) {
			validationResults.isValid = false
			validationResults.errors["expiryDate"] = "Fecha de expiración inválida (MM/YY)"
		}

		// CVV validation (3-4 digits)
		if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
			validationResults.isValid = false
			validationResults.errors["cvv"] = "CVV inválido"
		}

		// Card name validation
		if (!data.cardName || data.cardName.trim() === "") {
			validationResults.isValid = false
			validationResults.errors["cardName"] = "Nombre en la tarjeta es requerido"
		}
	}

	return validationResults
}

export default function CheckoutPage() {
	const { items, updateItemQuantity, removeItem, clearCart } = useCart()
	const [currentStep, setCurrentStep] = useState(1)
	const [shippingData, setShippingData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
		country: "Colombia",
	})
	const [paymentData, setPaymentData] = useState<{
		method: "card" | "mercadopago" | "bank"
		cardNumber: string
		expiryDate: string
		cvv: string
		cardName: string
	}>({
		method: "card",
		cardNumber: "",
		expiryDate: "",
		cvv: "",
		cardName: "",
	})
	// Declaración de errores de envío - Se usa en handleOrderConfirm y se pasa a ShippingForm
	const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({})
	// Declaración de errores de pago - Se usa en handleOrderConfirm
	const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({})
	
	// Create cart item objects with the structure expected by CartSummary component
	const cartItemsForSummary = items.map(item => ({
		id: item.id,
		name: item.name,
		image: item.image,
		price: item.price,
		quantity: item.quantity,
		size: item.selectedSize || 'Única',
		color: item.selectedColor || 'Estándar'
	}));
	
	const handleUpdateQuantity = (id: string, quantity: number) => {
		// Find the item to get its size and color
		const item = items.find(item => item.id === id);
		if (item) {
			updateItemQuantity(id, quantity, item.selectedSize, item.selectedColor);
		}
	}
	
	const handleRemoveItem = (id: string) => {
		// Find the item to get its size and color
		const item = items.find(item => item.id === id);
		if (item) {
			removeItem(id, item.selectedSize, item.selectedColor);
		}
	}
	
	const handleShippingNext = () => {
		const validationResult = validateShippingData(shippingData);
		if (validationResult.isValid) {
			setCurrentStep(3);
		} else {
			// Use toast instead of alert for better UX
			toast.error("Por favor completa correctamente todos los campos requeridos");
			// Scroll to top
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};
	
	const handlePaymentNext = () => {
		const validationResult = validatePaymentData(paymentData);
		if (validationResult.isValid) {
			setCurrentStep(4);
		} else {
			// Use toast instead of alert for better UX
			toast.error("Por favor completa correctamente todos los datos de pago");
			// Scroll to top
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};
	
	const handleOrderConfirm = () => {
		// Final validation before order submission
		const shippingValidation = validateShippingData(shippingData);
		const paymentValidation = validatePaymentData(paymentData);
		
		if (shippingValidation.isValid && paymentValidation.isValid) {
			toast.success("¡Pedido confirmado! Recibirás un email con los detalles.");
			
			// Here you would typically submit the order to your backend
			setTimeout(() => {
				clearCart();
				// Redirect to home page after order completion
				router.push('/');
			}, 2000);
		} else {
			toast.error("Por favor revisa los datos de envío y pago antes de confirmar.");
			if (!shippingValidation.isValid) {
				setCurrentStep(2);
				setShippingErrors(shippingValidation.errors);
			} else {
				setCurrentStep(3);
				setPaymentErrors(paymentValidation.errors);
			}
		}
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="font-montserrat font-bold text-3xl mb-2">
						Finalizar Compra
					</h1>
					<p className="text-muted-foreground">
						Completa tu pedido en Dulce Infancia.
					</p>
				</div>
				<CheckoutProgress currentStep={currentStep} steps={steps} />
				<div className="grid lg:grid-cols-3 gap-8 mt-8">
					<div className="lg:col-span-2">
						{currentStep === 1 && (
							<div>
								<h2 className="font-montserrat font-semibold text-xl mb-6">
									Tu carrito de compras
								</h2>
								{cartItemsForSummary.length > 0 ? (
									<>
										<CartSummary
											items={cartItemsForSummary}
											onUpdateQuantity={handleUpdateQuantity}
											onRemoveItem={handleRemoveItem}
											isEditable={true}
										/>
										<div className="mt-6">
											<Button
												onClick={() => setCurrentStep(2)}
												className="w-full"
												size="lg"
											>
												Continuar al envío
											</Button>
										</div>
									</>
								) : (
									<div className="text-center py-12 bg-brand-offWhite/50 rounded-xl">
										<svg 
											xmlns="http://www.w3.org/2000/svg" 
											width="64" 
											height="64" 
											viewBox="0 0 24 24" 
											fill="none" 
											stroke="currentColor" 
											strokeWidth="1.5" 
											strokeLinecap="round" 
											strokeLinejoin="round" 
											className="mx-auto mb-4 text-muted-foreground"
										>
											<circle cx="8" cy="21" r="1"/>
											<circle cx="19" cy="21" r="1"/>
											<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
										</svg>
										<h3 className="text-xl font-semibold mb-2">Tu carrito está vacío</h3>
										<p className="text-muted-foreground mb-6">Agrega productos para continuar con tu compra</p>
										<Button onClick={() => window.location.href = '/'} className="px-8">
											Volver a la tienda
										</Button>
									</div>
								)}
							</div>
						)}
						{currentStep === 2 && (
							<ShippingForm
								data={shippingData}
								errors={shippingErrors}
								onUpdate={setShippingData}
								onNext={handleShippingNext}
								onBack={() => setCurrentStep(1)}
							/>
						)}
						{currentStep === 3 && (
							<PaymentForm
								data={paymentData}
								errors={paymentErrors}
								onUpdate={setPaymentData}
								onNext={handlePaymentNext}
								onBack={() => setCurrentStep(2)}
							/>
						)}
						{currentStep === 4 && (
							<OrderConfirmation
								orderData={{
									shipping: shippingData,
									payment: paymentData,
									items: cartItemsForSummary,
								}}
								onConfirm={handleOrderConfirm}
								onBack={() => setCurrentStep(3)}
							/>
						)}
					</div>
					<div className="lg:col-span-1">
						<div className="sticky top-8">
							<CartSummary
								items={cartItemsForSummary}
								onUpdateQuantity={handleUpdateQuantity}
								onRemoveItem={handleRemoveItem}
								isEditable={false}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
