import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface ContactSectionProps {
  contactItems: {
    title: string;
    description: string;
    mailto: {
      email: string;
      subject: string;
      body: string;
    };
    icon: LucideIcon;
  }[];
}

const ContactSection = ({ contactItems }: ContactSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>문의하기</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contactItems.map((item, index) => (
            <a
              key={index}
              href={`mailto:${item.mailto.email}?subject=${encodeURIComponent(
                item.mailto.subject
              )}&body=${encodeURIComponent(item.mailto.body)}}`}
              className="group bg-primary/5 hover:bg-muted flex items-start gap-4 rounded-lg p-3 transition-colors"
            >
              <div className="bg-primary/20 text-primary flex shrink-0 items-center justify-center rounded-md p-1.5">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-muted-foreground text-xs">{item.description}</p>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
