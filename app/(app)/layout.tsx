import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/top-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-6 p-8">
      <div className="w-full max-w-[1040px] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div
          className="h-1"
          style={{
            background:
              "linear-gradient(90deg, var(--brand-green), var(--brand-blue) 50%, var(--brand-red))",
          }}
        />
        <TopNav email={user.email} />
        <div className="flex flex-1 flex-col p-6">{children}</div>
      </div>
      <div className="flex w-full max-w-[1040px] items-center justify-center pt-1">
        <div className="rounded dark:bg-white dark:p-1.5">
          <Image
            src="/civalerg-logo.png"
            alt="Civalerg"
            width={1987}
            height={1144}
            className="h-16 w-auto object-contain opacity-85"
          />
        </div>
      </div>
    </div>
  );
}
