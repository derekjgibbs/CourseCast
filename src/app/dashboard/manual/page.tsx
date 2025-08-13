import Link from "next/link";
import { CircleAlert } from "lucide-react";
import type { Metadata } from "next";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TutorialBanner } from "@/features/tutorial-banner";

export const metadata: Metadata = {
  title: "Manual - CourseCast",
  description: "User manual and documentation for CourseCast.",
};

export default function Page() {
  return (
    <div className="space-y-8 px-6 py-8">
      <TutorialBanner />
      <div className="prose dark:prose-invert mx-auto max-w-3xl">
        <h1>CourseCast User Manual</h1>
        <Card className="gap-0">
          <CardHeader className="not-prose">
            <CardTitle>A Note from Derek (12/4/24)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Hi there! I built this tool to help you (and me) get more out of Course Match.
              CourseMatch is a powerful system that tries very hard to give you what it thinks you
              want, based on the utilities you provide. The problem is that it&apos;s hard to
              translate what you want into the right utility values. You might end up with
              disappointing schedules simply because you didn&apos;t speak the Course Match
              &quot;language&quot; correctly.
            </p>
            <p>
              This tool is designed to help bridge that gap. By showing you potential schedules,
              CourseCast helps you build better intuition about how utility values translate to
              actual results. And unlike the &quot;Top Schedules&quot; tab in CourseMatch, this tool
              actually accounts for prices and variability.
            </p>
            <p>
              I hope this tool helps. Life is too short for crappy class schedules. Happy
              CourseCasting!
            </p>
            <p className="text-sm">
              <em>
                P.S. While this application works on mobile, I recommend using a desktop for a
                better experience. Also, huge thanks to Owen Kwon and Basti Ortiz for their help in
                building this! If you have any feedback or find any bugs, please let me know via
                email at{" "}
                <Link
                  href="mailto:djgibbs@wharton.upenn.edu"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  djgibbs@wharton.upenn.edu
                </Link>
                .
              </em>
            </p>
          </CardContent>
        </Card>

        <h2>CourseCast in a Nutshell</h2>
        <p>In short, CourseCast does five things:</p>
        <ol>
          <li>Allows you to browse and filter course information</li>
          <li>Allows you to assign utility values to courses</li>
          <li>Generates a price forecast based on historical data and uncertainty</li>
          <li>
            Solves the optimal schedule given the predicted prices, utility values, and constraints
          </li>
          <li>Simulates the schedule many times to see the probability of different outcomes</li>
        </ol>
        <p>
          <em>
            As with any forecast, none of the results are guaranteed. But, it might help you get a
            sense of what&apos;s possible and likely.
          </em>
        </p>

        <h2>Getting Started</h2>

        <h3>1. Dashboard Overview</h3>
        <p>
          When you first access CourseCast, you&apos;ll see the dashboard where you can manage your
          scenarios. Each scenario represents a different course selection strategy with its own
          constraints and utility values. This is up to you to customize.
        </p>
        <ul>
          <li>
            <strong>Search scenarios:</strong> use the search bar to find scenarios by name.
          </li>
          <li>
            <strong>Sort scenarios:</strong> click the &quot;Name&quot; or &quot;Created&quot;
            badges to sort your scenarios.
          </li>
          <li>
            <strong>View scenario details:</strong> each scenario card shows token budget, max
            credits, fixed courses count, and course utilities count.
          </li>
        </ul>

        <h3>2. Creating a New Scenario</h3>
        <p>
          Click the &quot;Create New Scenario&quot; card to start a new course selection strategy:
        </p>
        <ol>
          <li>Enter a descriptive name for your scenario.</li>
          <li>Set your token budget (typically 3000-5500).</li>
          <li>Set your maximum credit units (typically 3.0-7.5).</li>
          <li>Click &quot;Create Scenario&quot; to proceed.</li>
        </ol>

        <h2>Configuring Your Scenario</h2>
        <p>
          After creating a scenario, you&apos;ll be taken to the configuration page where you can
          set up your course preferences and constraints.
        </p>

        <h3>1. Basic Settings</h3>
        <p>Update your scenario&apos;s basic configuration:</p>
        <ul>
          <li>
            <strong>Scenario Name:</strong> change the name to help identify this strategy.
          </li>
          <li>
            <strong>Token Budget:</strong> adjust your available tokens for course bidding.
          </li>
          <li>
            <strong>Maximum Credits:</strong> set the maximum number of credits you want to take.
          </li>
        </ul>

        <h3>2. Course Selection Type</h3>
        <p>Choose between two modes based on your student status:</p>
        <ul>
          <li>
            <strong>Regular Students:</strong> select from the general course catalog.
          </li>
          <li>
            <strong>Pre-term Students:</strong> configure fixed core courses that you&apos;re
            already enrolled in.
          </li>
        </ul>
        <Alert variant="destructive" className="not-prose">
          <CircleAlert />
          <AlertDescription>
            <span>
              You must correctly choose between <strong>Regular</strong> and{" "}
              <strong>Pre-term</strong> student modes. If you are a pre-term student but select the
              regular mode, the fixed core courses required for pre-term students will{" "}
              <strong>not</strong> be applied to your scenario, which will likely result in
              inaccurate simulations.
            </span>
          </AlertDescription>
        </Alert>

        <h3>3. Course Utilities</h3>
        <p>
          This is the most important part of your configuration. Assign utility values (0-100) to
          courses based on how much you want to take them:
        </p>
        <ul>
          <li>
            <strong>High values (70-100):</strong> courses you really want to take.
          </li>
          <li>
            <strong>Medium values (30-70):</strong> courses you&apos;re interested in but flexible
            about.
          </li>
          <li>
            <strong>Low values (1-30):</strong> backup options or courses you&apos;re only somewhat
            interested in.
          </li>
          <li>
            <strong>Zero values:</strong> courses you don&apos;t want (these won&apos;t appear in
            simulations).
          </li>
        </ul>

        <h3>4. Course Catalog Browser</h3>
        <p>Use the course catalog to explore available courses and set utilities:</p>
        <ul>
          <li>
            <strong>Search:</strong> use keywords to find specific courses based on code,
            department, title, or instructors.{" "}
          </li>
          <li>
            <strong>Sort:</strong> click column headers to sort by different criteria.
          </li>
          <li>
            <strong>Add to selected courses:</strong> add a course to your &quot;cart&quot; in order
            to assign utility to it.
          </li>
        </ul>

        <h3>5. Save Your Configuration</h3>
        <p>
          Click the &quot;Save Scenario&quot; button (disk icon) at the bottom of the page to save
          your changes.
        </p>

        <h2>Running Simulations</h2>
        <p>
          Once you&apos;ve configured your scenario, click &quot;Let&apos;s go!&quot; in the blue
          banner to proceed to the simulation page.
        </p>

        <h3>Simulation Process</h3>
        <p>
          CourseCast runs 100 Monte Carlo simulations to account for the uncertainty in course
          prices and registration outcomes. Each simulation:
        </p>
        <ol>
          <li>Generates random price forecasts based on historical data.</li>
          <li>Solves for the optimal schedule given those prices.</li>
          <li>Records which courses appear in the optimal solution.</li>
        </ol>

        <h3>Understanding Results</h3>
        <p>The simulation results show two key metrics.</p>

        <h4>Course Probabilities</h4>
        <p>For each successful course that you assigned utility to, you&apos;ll see:</p>
        <ul>
          <li>
            <strong>Probability:</strong> the percentage of simulations where this course appeared
            in the optimal schedule.
          </li>
          <li>
            <strong>Course details:</strong> department, title, instructor, time, credits, and other
            metadata.
          </li>
        </ul>

        <h4>Schedule Probabilities</h4>
        <p>The top 3 most common complete schedules, showing:</p>
        <ul>
          <li>
            <strong>Probability:</strong> how often this exact combination of courses appeared.
          </li>
          <li>
            <strong>Course list:</strong> all courses in this schedule with their details.
          </li>
          <li>
            <strong>Schedule statistics:</strong> total credits of the schedule.
          </li>
        </ul>

        <h2>Tips for Success</h2>

        <h3>Setting Utility Values</h3>
        <ul>
          <li>
            <strong>Start broad.</strong> Give many courses a moderate utility value (like 50) to
            start.
          </li>
          <li>
            <strong>Experiment.</strong> Run simulations, then adjust utilities based on results.
          </li>
          <li>
            <strong>Compare.</strong> Duplicate scenarios to test your hypotheses.
          </li>
          <li>
            <strong>Be realistic.</strong> Don&apos;t assign high utilities to courses that conflict
            in time.
          </li>
          <li>
            <strong>Save frequently.</strong> Use &quot;Save Scenario&quot; often to preserve your
            work.
          </li>
        </ul>

        <h3>Interpreting Results</h3>
        <ul>
          <li>
            <strong>High probability courses (&gt;70%):</strong> very likely to be in your optimal
            schedule.
          </li>
          <li>
            <strong>Medium probability courses (30-70%):</strong> sometimes optimal, but depends on
            prices.
          </li>
          <li>
            <strong>Low probability courses (&lt;30%):</strong> rarely optimal given your utilities
            and constraints.
          </li>
        </ul>

        <h3>Strategy Development</h3>
        <ul>
          <li>
            <strong>Diversify time slots:</strong> add courses at different times to avoid
            conflicts.
          </li>
          <li>
            <strong>Create backup plans:</strong> include more courses than you need in case some
            become expensive.
          </li>
          <li>
            <strong>Iterate:</strong> create multiple scenarios to test different strategies.
          </li>
          <li>
            <strong>Consider trade-offs:</strong> balance course quality, instructor ratings,
            workload, and schedule preferences.
          </li>
        </ul>

        <h2>Scenario Management</h2>
        <p>From any scenario page, you can:</p>
        <ul>
          <li>
            <strong>Duplicate:</strong> create a copy to test variations of your strategy.
          </li>
          <li>
            <strong>Delete:</strong> remove scenarios you no longer need.
          </li>
          <li>
            <strong>Return to dashboard:</strong> access all your scenarios from the main dashboard.
          </li>
        </ul>

        <h2>Limitations and Considerations</h2>
        <ul>
          <li>
            <strong>Forecasts are not guarantees:</strong> actual Course Match results may differ.
          </li>
          <li>
            <strong>Historical data:</strong> price forecasts are based on past semester data.
          </li>
          <li>
            <strong>Compound utilities:</strong> assigning utilities to a group of courses is
            currently unsupported.
          </li>
          <li>
            <strong>Desktop recommended:</strong> while mobile-compatible, desktop provides the best
            experience.
          </li>
        </ul>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Happy CourseCasting! 🎯
        </p>
      </div>
    </div>
  );
}
