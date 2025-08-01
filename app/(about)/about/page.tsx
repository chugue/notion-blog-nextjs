// export default function About() {
//   return (
//     <div className="space-y-8">
//       {/* 페이지 헤더 */}
//       <div className="border-b pb-6">
//         <h1 className="text-3xl font-bold tracking-tight">프로필</h1>
//         <p className="text-muted-foreground mt-2 text-lg">
//           안녕하세요! 저는 사용자 경험을 중시하는 프론트엔드 개발자입니다.
//         </p>
//       </div>

//       {/* 소개 섹션 */}
//       <section className="space-y-6">
//         <h2 className="text-2xl font-semibold">소개</h2>
//         <div className="prose text-muted-foreground max-w-none">
//           <p className="leading-7">
//             10년 이상의 경력을 가진 UX/UI 전문 프론트엔드 개발자로, 뛰어난 미적 감각과 사용자 경험에
//             대한 깊은 이해를 바탕으로 아름답고 사용하기 쉬운 인터페이스를 구현하는 것이 전문입니다.
//           </p>
//           <p className="leading-7">
//             React, Next.js, TypeScript를 주력으로 사용하며, 컴포넌트 설계부터 디자인 시스템 구축까지
//             프론트엔드 개발의 전 영역에서 활동하고 있습니다.
//           </p>
//         </div>
//       </section>

//       {/* 전문 분야 */}
//       <section className="space-y-6">
//         <h2 className="text-2xl font-semibold">전문 분야</h2>
//         <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//           <div className="space-y-3">
//             <h3 className="text-lg font-medium">UI/UX 개발</h3>
//             <ul className="text-muted-foreground space-y-2 text-sm">
//               <li>• 반응형 웹 디자인</li>
//               <li>• 인터랙티브 애니메이션</li>
//               <li>• 접근성(A11y) 최적화</li>
//             </ul>
//           </div>
//           <div className="space-y-3">
//             <h3 className="text-lg font-medium">컴포넌트 개발</h3>
//             <ul className="text-muted-foreground space-y-2 text-sm">
//               <li>• 재사용 가능한 컴포넌트 설계</li>
//               <li>• 디자인 시스템 구축</li>
//               <li>• 성능 최적화</li>
//             </ul>
//           </div>
//         </div>
//       </section>

//       {/* 현재 관심사 */}
//       <section className="space-y-6">
//         <h2 className="text-2xl font-semibold">현재 관심사</h2>
//         <div className="flex flex-wrap gap-2">
//           {[
//             'Next.js 14',
//             'Server Components',
//             'TailwindCSS',
//             'Framer Motion',
//             'Radix UI',
//             'TypeScript',
//             'Design Systems',
//             'Web Performance',
//           ].map((tech) => (
//             <span
//               key={tech}
//               className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-medium"
//             >
//               {tech}
//             </span>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }
