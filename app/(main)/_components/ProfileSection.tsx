import { Card, CardContent } from '@/components/ui/card';
import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ProfileSectionProps {
  socialLinks: {
    href: string;
    icon: LucideIcon;
  }[];
}

const ProfileSection = ({ socialLinks }: ProfileSectionProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full p-2">
              <div className="h-36 w-36 overflow-hidden rounded-full">
                <Image
                  src="/images/profile.png"
                  width={144}
                  height={144}
                  alt="profile"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold">스티븐코딩</h3>
            <p className="text-primary text-sm">Full Stack Developer</p>
          </div>
          <div className="flex justify-between gap-2">
            {socialLinks.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="bg-primary/10 size-10"
                size="icon"
                asChild
              >
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <item.icon className="h-5 w-5" />
                </a>
              </Button>
            ))}
          </div>
          <p className="bg-primary/10 rounded p-2 text-center text-sm">코딩 교육 크리에이터 ✨</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSection;
