import React from "react";

export const metadata = {
  title: "Terms and Conditions",
};

const Terms = [
  {
    id: 1,
    title: "Introduction",
    description:
      "Welcome to the Raveza Events website (referred to as “Raveza”). These Terms and Conditions of Use (“Terms”) govern your access to and use of our website at raveza.vercel.app, operated by Umoja Technologies Limited, a company incorporated under the laws of Kenya with its offices located at Masai Lodge, Rongai Road, Nairobi. By accessing or using our website, you agree to comply with these Terms and our Privacy Policy. Please review them carefully.",
  },
  {
    id: 2,
    title: "Communication terms",
    description:
      "By accessing the Raveza website, you hereby consent to receive communications from us, including but not limited to newsletters, marketing materials, promotional messages, and other related correspondence. You may withdraw your consent and opt out of receiving such communications at any time by following the unsubscribe instructions provided in our communications or by contacting us directly at info@raveza.com.",
  },
  {
    id: 3,
    title: "Acceptance of site's Terms",
    description:
      "By accessing or using the Raveza website, you acknowledge that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy, both of which are available on our website. If you do not agree to any provision of these Terms, you are advised to discontinue use of the website immediately. ",
  },
  {
    id: 4,
    title: "Intellectual Property",
    description:
      "All content on the Raveza website, including but not limited to its design, text, graphics, logos, trademarks, images, and software, is the sole and exclusive property of Umoja Technologies Limited or its licensors and is protected by applicable intellectual property laws. Any unauthorized reproduction, distribution, modification, transmission, or use of this material, in whole or in part, is strictly prohibited and may result in legal action.",
  },
  {
    id: 5,
    title: "Promotions and Discounts",
    description:
      "Event organizers may offer promotions, discounts, or special offers on event tickets. All such promotional activities must strictly comply with Raveza’s promotional guidelines, as well as all applicable laws and regulations. Any violation of these guidelines may result, at Raveza’s sole discretion, in the immediate removal of the promotion, suspension or termination of the associated event listing, and, where applicable, further legal action or account suspension.",
  },
  {
    id: 6,
    title: "Use of the Site",
    description:
      "You agree to use the website exclusively for lawful purposes and in full compliance with all applicable laws, regulations, and guidelines of the Republic of Kenya. You shall not use the website in any manner that could damage, disable, overburden, or impair the functionality of the site, nor interfere with or disrupt the use and enjoyment of the site by any other party. Raveza reserves the right, at its sole discretion, to suspend or terminate your access to the website without prior notice if it determines that you have violated these Terms. ",
  },
];

const TermsPage = () => {
  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row px-4 space-y-6 my-6 sm:my-12 text-slate-700">
        <div className="w-full sm:w-3/4 flex flex-col gap-2">
          <div>
            <h1 className="font-bold sm:text-2xl uppercase ">
              Raveza Terms and Conditions of Use
            </h1>
          </div>

          <div className="flex flex-col gap-4">
            {Terms.map((term) => (
              <div key={term.id}>
                <h2 className="font-semibold font-poppins text-lg">
                  {term.id}. {term.title}
                </h2>
                <p>{term.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsPage;
