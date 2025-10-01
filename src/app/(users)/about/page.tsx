export default function AboutPage() {
  return (
    <div className="bg-[var(--background)] min-h-screen text-[var(--foreground)] mt-5">
      <main className="p-6 max-w-3xl mx-auto">
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: "var(--accent)" }}
        >
          About WormScans
        </h1>

        <p className="leading-relaxed mb-4">
          WormScans started as one of those “I’ll just automate this real quick”
          projects… and then spiraled into a full-blown manga/manhwa chapter
          scraping and organizing machine.
        </p>

        <p className="leading-relaxed mb-4">
          Instead of painfully downloading chapters one at a time like it’s
          2008, WormScans swoops in, grabs the images, sorts them neatly, and
          ships them off to a database, like a polite little worm librarian that
          doesn’t judge your reading habits.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">✨ What It Does</h2>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>
            Sneaks through supported reading sites using a headless browser to
            grab chapter images. 🕵️‍♂️
          </li>
          <li>
            Auto-organizes everything by series and chapter, because chaos is
            for cliffhangers, not folders.
          </li>
          <li>
            Lets you trim, delete, and upload chapters through a clean UI, no
            Photoshop rage required.
          </li>
          <li>
            Stores it all in a central Supabase database, ready to be served to
            your reader app like a well-plated meal.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">📬 Legal & Contact</h2>
        <p className="leading-relaxed mb-4">
          This project is meant for personal use, testing, and archiving...
          basically, for people who like tidy libraries and good UX. If you're a
          copyright holder or have any legal concerns, please don’t hesitate to
          reach out.
        </p>

        <p className="leading-relaxed mb-4">
          To avoid becoming an all-you-can-eat buffet for spambots, you can
          reach me through{" "}
          <a
            href="https://github.com/junoocha"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            my GitHub profile
          </a>{" "}
          if you need to get in touch.
        </p>

        <p className="text-sm text-gray-400 mt-8">
          © {new Date().getFullYear()} WormScans. This is a personal project and
          is not affiliated with or endorsed by any official publishers. Any
          resemblance to professional scanlation teams is purely coincidental
          (and probably unintentional).
        </p>
      </main>
    </div>
  );
}
