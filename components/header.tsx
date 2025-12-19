"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Rocket, Menu, X, Cpu } from "lucide-react"

const NAV_LINKS = [
    { href: "#entity-intro", label: "Hero" },
    { href: "#simulator", label: "MVP Simulator" },
    { href: "#process", label: "Process" },
    { href: "#projects", label: "Projects" },
    { href: "#pricing", label: "Pricing" },
]

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeSection, setActiveSection] = useState("")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)

            // Section tracking
            const sections = NAV_LINKS.map(link => link.href.substring(1))
            for (const section of sections.reverse()) {
                const element = document.getElementById(section)
                if (element && window.scrollY >= element.offsetTop - 100) {
                    setActiveSection(`#${section}`)
                    break
                }
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-4 md:px-8",
                isScrolled ? "py-4 bg-background/80 backdrop-blur-xl border-b border-primary/20" : "py-6 bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
                        <Cpu className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter text-foreground group-hover:text-primary transition-colors">
                        FORMATDISC<span className="text-primary tracking-normal font-light">™</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-all hover:text-primary relative",
                                activeSection === link.href ? "text-primary" : "text-foreground/70"
                            )}
                        >
                            {link.label}
                            {activeSection === link.href && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            )}
                        </Link>
                    ))}
                    <Link
                        href="#simulator"
                        className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(0,255,153,0.4)] active:scale-95 flex items-center gap-2"
                    >
                        <Rocket className="w-4 h-4" />
                        Build Now
                    </Link>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-primary/20 p-8 md:hidden flex flex-col gap-6 text-center"
                    >
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "text-lg font-medium",
                                    activeSection === link.href ? "text-primary" : "text-foreground/70"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
