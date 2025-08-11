import { Dialog } from "@/components/ui/dialog";

import { TutorialBannerContent } from "./banner";
import { TutorialPlayerContent } from "./player";

export function TutorialBanner() {
  return (
    <Dialog>
      <TutorialBannerContent />
      <TutorialPlayerContent />
    </Dialog>
  );
}
