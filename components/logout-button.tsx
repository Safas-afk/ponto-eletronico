import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline">
        Sair
      </Button>
    </form>
  );
}
