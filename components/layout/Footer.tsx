import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPinHouse,
  PhoneCall,
  Twitter,
} from "lucide-react";
import new_logo from "@/images/logo/new_logo.png";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-50 text-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div>
            <Link href="/" className="flex items-center">
              <Image
                src={new_logo}
                width={200}
                height={200}
                alt="logo"
                className="object-contain w-[100px] h-[100px] md:w-[140px] md:h-[140px] absolute -left-2 -top-10"
                priority
              />
            </Link>
            <p className="text-neutral-600 mb-4 mt-16">
              Your trusted platform for discovering and booking event tickets
              across Kenya.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted hover:fill-neutral-950 transition duration-300"
              >
                <Facebook className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="text-muted hover:fill-neutral-950 transition duration-300"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="text-muted hover:fill-neutral-950 transition duration-300"
              >
                <Instagram className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="text-muted hover:fill-neutral-950 transition duration-300"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-neutral-500 hover:text-neutral-900 transition duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/event"
                  className="text-neutral-500 hover:text-neutral-900 transition duration-300"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-neutral-500 hover:text-neutral-900 transition duration-300"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-neutral-500 hover:text-neutral-900 transition duration-300"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className="text-neutral-500 hover:text-neutral-900 transition duration-300"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-500 hover:text-neutral-900 transition duration-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-neutral-500 hover:text-neutral-900 transition duration-300"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="faqs"
                  className="text-neutral-500 hover:text-neutral-900 transition duration-300"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/termsOfService"
                  className="text-neutral-500 hover:text-neutral-900 transition duration-300"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacyPolicy"
                  className="text-neutral-500 hover:text-neutral-900 transition duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refundPolicy"
                  className="text-neutral-500 hover:text-neutral-900 transition duration-300"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold font-montserrat mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <MapPinHouse className="w-4 h-4 mr-3 text-landingsecondary shrink-0" />
                <span className="text-neutral-500">
                  Masai Lodge, Nairobi, Kenya
                </span>
              </li>
              <li className="flex items-center">
                <PhoneCall className="w-4 h-4 mr-3 text-landingsecondary shrink-0" />
                <span className="text-neutral-500">+254 742 642356</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-landingsecondary shrink-0" />
                <span className="text-neutral-500">info@raveza.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700/30 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-landingsecondary/90 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} UmojaTechnologies Ltd. All rights
            reserved.
          </p>
          <div className="flex space-x-6"></div>
        </div>
      </div>
    </footer>
  );
}
