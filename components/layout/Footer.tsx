import {
  Instagram,
  Linkedin,
  Mail,
  MapPinHouse,
  PhoneCall,
  Twitter,
} from "lucide-react";
import new_logo from "@/images/logo/grupu5.png";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-50 text-neutral-950 pb-4 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-card rounded-lg p-6 mb-8 shadow-md gap-3 shadow-primary flex flex-col md:flex-row md:items-center md:justify-between md:gap-8">
          <li className="flex items-center gap-3">
            <div className="p-4 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
              <MapPinHouse className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-neutral-500 flex flex-col text-sm md:text-base">
              <span className="font-bold text-xs md:text-sm">Reach out</span>
              Masai Lodge, Nairobi, Kenya
            </span>
          </li>
          <li className="flex items-center gap-3 ">
            <div className="p-4 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
              <PhoneCall className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-neutral-500 flex flex-col text-sm md:text-base">
              <span className="font-bold text-xs md:text-sm">
                Give us a call
              </span>
              +254 742 642356
            </span>
          </li>
          <li className="flex items-center gap-3">
            <div className="p-4 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-neutral-500 flex flex-col text-sm md:text-base">
              <span className="font-bold text-xs md:text-sm">Email us</span>
              info@raveza.com
            </span>
          </li>
        </div>
        <div className="flex md:justify-evenly flex-col md:flex-row gap-8 ">
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center justfify-center">
              <Image
                src={new_logo}
                width={100}
                height={100}
                alt="logo"
                className="object-contain w-20 h-20 md:w-22 md:h-22"
                priority
              />
            </Link>
            <p className="text-neutral-500 text-xs md:text-sm lg:text-base mt-4">
              Raveza is your go-to platform for discovering and booking live
              events. Join us to experience the thrill of concerts, festivals,
              and more!
            </p>
          </div>
          <div>
            <h3 className="md:text-lg text-shadow-primary/50 font-semibold font-montserrat">
              Follow Us
            </h3>
            <div className="flex space-x-4 md:justify-center items-center mt-4">
              <Link
                href="#"
                className="p-4 bg-primary/10 rounded-full flex items-center justify-center shrink-0"
              >
                <Twitter className="w-4 h-4 text-black" />
              </Link>
              <Link
                href="#"
                className="p-4 bg-primary/10 rounded-full flex items-center justify-center shrink-0"
              >
                <Instagram className="w-4 h-4 text-black" />
              </Link>
              <Link
                href="#"
                className="p-4 bg-primary/10 rounded-full flex items-center justify-center shrink-0"
              >
                <Linkedin className="w-4 h-4 text-black" />
              </Link>
            </div>
          </div>

          <div className="flex justify-between md:justify-evenly w-full">
            <div>
              <h3 className="md:text-lg text-shadow-primary/50 font-semibold font-montserrat mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-neutral-500 hover:text-neutral-900 transition duration-300 text-xs md:text-sm lg:text-base"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-neutral-500 hover:text-neutral-900 transition duration-300 text-xs md:text-sm lg:text-base"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-200 mt-8 pt-4 text-center">
          <p className="text-muted-foreground text-xs md:text-sm lg:text-base  text-center">
            &copy; {new Date().getFullYear()} JMorris Tech Ltd. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
