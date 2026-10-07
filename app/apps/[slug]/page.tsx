import {redirect} from 'next/navigation';
import {toolHref} from '@/src/lib/swa-marketplace';
export default async function LegacyAppPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;redirect(toolHref(slug));
}
