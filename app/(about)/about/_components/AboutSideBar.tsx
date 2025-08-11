import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import {
  Briefcase,
  Code2,
  GraduationCap,
  Heart,
  Link,
  Mail,
  Menu,
  Target,
  User,
  X,
} from 'lucide-react';

const menuItems = [
  {
    id: 'profile',
    label: '프로필',
    icon: User,
    href: '/about',
  },
  {
    id: 'skills',
    label: '기술 스택',
    icon: Code2,
    href: '/about/skills',
  },
  {
    id: 'career',
    label: '경력',
    icon: Briefcase,
    href: '/about/career',
  },
  {
    id: 'projects',
    label: '프로젝트',
    icon: Target,
    href: '/about/projects',
  },
  {
    id: 'education',
    label: '교육 & 자격',
    icon: GraduationCap,
    href: '/about/education',
  },
  {
    id: 'interests',
    label: '관심사',
    icon: Heart,
    href: '/about/interests',
  },
  {
    id: 'contact',
    label: '연락처',
    icon: Mail,
    href: '/about/contact',
  },
];

const AboutSideBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActiveLink = (href: string) => {
    if (href === '/about') {
      return pathname === '/about';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="bg-background text-foreground hover:bg-accent mb-4 flex items-center gap-2 rounded-lg border p-2 transition-colors lg:hidden"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          <span className="font-medium">메뉴</span>
        </button>

        {/* Sidebar */}
        <aside
          className={`w-full lg:sticky lg:top-24 lg:h-fit lg:w-64 ${isSidebarOpen ? 'block' : 'hidden lg:block'} transition-all duration-300 ease-in-out`}
        >
          <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
            {/* Profile Section */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">개발자 이름</h3>
              <p className="text-muted-foreground text-sm">Frontend Developer</p>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveLink(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    } `}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="border-border mt-8 border-t pt-6">
              <p className="text-muted-foreground text-center text-xs">
                © 2024 Developer Portfolio
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AboutSideBar;
