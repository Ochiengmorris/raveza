import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPinHouse,
  PhoneCall,
  Twitter,
} from "lucide-react";
import new_logo from "@/images/logo/logo_newer.png";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-50 text-neutral-950 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="flex md:justify-evenly flex-col md:flex-row gap-8 relative">
          <div>
            <Link href="/" className="flex items-center relative">
              <Image
                src={new_logo}
                width={200}
                height={200}
                alt="logo"
                className="object-contain w-[150px] h-[150px] md:w-[180px] md:h-[180px] absolute md:-top-18 left-1/2 -translate-x-1/2"
                priority
              />
            </Link>
            <p className="text-muted-foreground text-center mt-10">
              &copy; {new Date().getFullYear()} UmojaTechnologies Ltd.
              <br /> All rights reserved.
            </p>
            <div className="flex space-x-4 justify-center mt-4">
              <Link
                href="#"
                className="text-muted-foreground hover:fill-neutral-950 transition duration-300"
              >
                <Facebook className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:fill-neutral-950 transition duration-300"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:fill-neutral-950 transition duration-300"
              >
                <Instagram className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:fill-neutral-950 transition duration-300"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="flex justify-between md:justify-evenly w-full">
            <div>
              <h3 className="text-lg font-semibold font-montserrat mb-4">
                Support
              </h3>
              <ul className="space-y-2">
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
        </div>
      </div>
    </footer>
  );
}
