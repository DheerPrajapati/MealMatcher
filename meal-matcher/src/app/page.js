// import Image from "next/image";

import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href={"/users"}>Users</Link>
    </div>
  );
}
