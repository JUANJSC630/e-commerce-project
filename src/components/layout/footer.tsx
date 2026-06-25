"use client"

import Link from "next/link"
import {
  Instagram,
  Facebook,
  Truck,
  Gift,
  ShieldCheck,
  BadgeCheck,
  Mail,
  Phone,
} from "lucide-react"
import { routes } from "@/config/store.config"
import { useSettings } from "@/components/providers/settings-provider"
import { TikTokIcon, WhatsAppIcon } from "@/components/icons/brand-icons"
import type { NavItem } from "@/lib/categories"

/** Builds a wa.me link from a raw number or an already-complete URL. */
function whatsappHref(value: string): string {
  if (/^https?:\/\//.test(value)) return value
  const digits = value.replace(/\D/g, "")
  return `https://wa.me/${digits}`
}

const TRUST = [
  { icon: Truck, title: "Envío a todo el país", sub: "Despachos a toda Colombia" },
  { icon: Gift, title: "Listo para regalar", sub: "Empaque cuidado" },
  { icon: ShieldCheck, title: "Pago 100% seguro", sub: "Procesado con MercadoPago" },
  { icon: BadgeCheck, title: "Calidad garantizada", sub: "Prendas que duran" },
]

export function Footer({ navItems }: { navItems: NavItem[] }) {
  const { brand, social, contact } = useSettings()
  const year = new Date().getFullYear()
  const hasWhatsapp = Boolean(social.whatsapp)

  return (
    <footer className="bg-brand-ink text-brand-surface" aria-label="Pie de página">
      {/* Trust strip — last reassurance before leaving, on every page */}
      <div className="border-b border-brand-surface/10">
        <div className="container mx-auto px-4 py-7 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
          {TRUST.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <Icon className="h-6 w-6 shrink-0 text-brand-base" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{title}</p>
                <p className="text-xs text-brand-surface/60 leading-tight mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="container mx-auto px-4 py-12 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10">
          {/* Brand + social */}
          <div className="col-span-2 md:col-span-5 lg:col-span-4">
            <Link
              href={routes.home}
              className="font-display font-bold text-2xl text-brand-surface hover:text-brand-base transition-colors"
            >
              {brand.name}
            </Link>
            <p className="mt-3 text-sm text-brand-surface/70 leading-relaxed max-w-sm">
              {brand.description}
            </p>

            {(social.instagram || social.facebook || social.tiktok || hasWhatsapp) && (
              <div className="flex items-center gap-2.5 mt-6">
                {social.instagram && (
                  <SocialLink href={social.instagram} label="Instagram">
                    <Instagram className="h-4 w-4" aria-hidden="true" />
                  </SocialLink>
                )}
                {social.facebook && (
                  <SocialLink href={social.facebook} label="Facebook">
                    <Facebook className="h-4 w-4" aria-hidden="true" />
                  </SocialLink>
                )}
                {social.tiktok && (
                  <SocialLink href={social.tiktok} label="TikTok">
                    <TikTokIcon className="h-4 w-4" />
                  </SocialLink>
                )}
                {hasWhatsapp && (
                  <SocialLink href={whatsappHref(social.whatsapp)} label="WhatsApp">
                    <WhatsAppIcon className="h-4 w-4" />
                  </SocialLink>
                )}
              </div>
            )}
          </div>

          {/* Shop */}
          <FooterColumn title="Comprar" className="md:col-span-3 lg:col-span-3">
            {navItems.map((item) => (
              <FooterLink key={item.href} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
            <FooterLink href={routes.products}>Todos los productos</FooterLink>
            <FooterLink href={routes.favorites}>Mis favoritos</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
          </FooterColumn>

          {/* Account */}
          <FooterColumn title="Tu cuenta" className="md:col-span-2 lg:col-span-2">
            <FooterLink href={routes.account}>Mi cuenta</FooterLink>
            <FooterLink href="/cuenta/pedidos">Mis pedidos</FooterLink>
            <FooterLink href="/cuenta/login">Iniciar sesión</FooterLink>
            <FooterLink href="/cuenta/registro">Crear cuenta</FooterLink>
          </FooterColumn>

          {/* Contact */}
          <div className="col-span-2 md:col-span-2 lg:col-span-3">
            <h2 className="font-display font-semibold text-xs uppercase tracking-widest text-brand-surface/50 mb-4">
              ¿Necesitas ayuda?
            </h2>
            {hasWhatsapp && (
              <a
                href={whatsappHref(social.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-base text-brand-on-base text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Escríbenos por WhatsApp
              </a>
            )}
            <ul className="mt-4 space-y-2.5 text-sm" role="list">
              {contact.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center gap-2 text-brand-surface/80 hover:text-brand-base transition-colors"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 text-brand-surface/80 hover:text-brand-base transition-colors"
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.address && <li className="text-brand-surface/60">{contact.address}</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-surface/10">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-surface/50">
          <p>
            &copy; {year} {brand.copyright}
          </p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Pagos seguros con MercadoPago
          </p>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Síguenos en ${label}`}
      className="grid place-items-center h-9 w-9 rounded-full bg-brand-surface/10 text-brand-surface hover:bg-brand-base hover:text-brand-on-base transition-colors"
    >
      {children}
    </a>
  )
}

function FooterColumn({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <h2 className="font-display font-semibold text-xs uppercase tracking-widest text-brand-surface/50 mb-4">
        {title}
      </h2>
      <ul className="space-y-2.5" role="list">
        {children}
      </ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-brand-surface/80 hover:text-brand-base transition-colors"
      >
        {children}
      </Link>
    </li>
  )
}
