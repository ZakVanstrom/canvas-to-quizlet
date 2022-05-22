import os.path
from bs4 import BeautifulSoup as bs
import re
import time

# Global Variables for Reporting
q_seen = 0
a_seen = 0
q_written = 0
a_written = 0
failure = 0

# Options
log = False
adv_log = False
set_view_results = True
write_to_single_file = True


def performance_test(func, args, repetitions=10, arg_list=None, name=None, print_times=True):
    def now(): return time.process_time()
    times = []
    t0 = now()
    for i in range(repetitions):
        t = now()
        if arg_list != None:
            args = arg_list[i]
        if type(args) is list:
            func(*args)
        else:
            func(args)
        times.append(now()-t)
    t1 = now()

    stats = {}
    stats['total'] = t1-t0
    stats['average'] = sum(times)/len(times)
    stats['low'] = min(times)
    stats['high'] = max(times)
    stats['range'] = stats['high'] - stats['low']

    stats = {k: "{:.2f}".format(stats[k]) for k in stats.keys()}
    time_strings = ["{:.2f}".format(t) for t in times]

    if name == None:
        print("Run Finished!")
    else:
        print(f"{name}: Run Finished")

    if print_times:
        print(f"\tTimes (s): {', '.join(time_strings)}")

    print(f"\tTotal Run Time: {stats['total']} seconds.")
    print(f"\tAverage was {stats['average']} seconds.")
    print(f"\tFastest Run was {stats['low']} seconds")
    print(f"\tSlowest was {stats['high']}.")
    print(f"\tRange of {stats['range']} seconds.")


def get_pairs(file) -> dict:
    global a_seen, q_seen
    scrape = bs(file, features="html.parser")
    all_questions = scrape.select('div.text')
    pairs = []
    if log:
        print("Question Count: " + str(len(all_questions)))
    for q in all_questions:
        q_seen += 1
        question_text = clean_up(
            q.find('div', class_='question_text user_content').text)
        answers = q.findAll('div', class_=["answer_for_"])
        answer_texts = []
        for a in answers:
            answer_string = str(a['title'])
            if "correct answer" not in answer_string:
                continue
            a_seen += 1
            cor_ans = ". The correct answer was "
            i = answer_string.find(cor_ans)
            if i >= 0:
                i1 = answer_string.find(" You selected ")
                part1 = clean_up(answer_string[0:i1])
                part2 = clean_up(answer_string[i+len(cor_ans)::])
                answer_string = part1 + " --> " + part2
            answer_texts.append(clean_up(answer_string, 'answer'))
        pairs.append([question_text, answer_texts])
        if log:
            print("# Answers: " + str(len(answers)))
            if adv_log:
                print('\n\t'.join(answer_texts))
    return pairs

# get pairs with Select
    # question_text = clean_up(q.select("div[class='question_text user_content']")[0].text)
    # answers = q.select('div[class="answer answer_for_ selected_answer correct_answer"]')


def clean_up(txt, object_type=''):
    txt = str(txt).replace('\n', '  ').replace(
        ';', '.').replace('\t', ' ')
    if object_type == 'answer':
        txt = txt.replace(". This was the correct answer.", '')
        txt = txt.replace(". You selected this answer", '')
        txt = txt.replace(". You selected ", " --> ")
    return txt.strip()


def write_pairs(pairs: dict, location: str):
    global a_written, q_written
    with open(location, 'a+', encoding="utf8") as f:
        for pair in pairs:
            a_written += len(pair[1])
            q_written += 1
            answer_as_text = '\n\n'.join(pair[1])
            f.write(f"{pair[0]}\t{answer_as_text};")


def write_html_file(file, path):
    f = open(path, 'w')
    f.write(file)


def get_output_path(input_path):
    split = os.path.split(input_path)
    out = split[0] + "/../output/" + split[1].split('.')[0] + "-output.txt"
    if os.path.exists(out):
        os.remove(out)
    return out


def get_HTML_paths_from_directory(dir_path):
    return [os.path.join(dir_path, f) for f in os.listdir(dir_path) if f.endswith(".html")]


def main():
    # html_paths = [input("Enter the Input File Path")]
    # html_paths = ["/Users/zak/dev/canvas-to-quizlet/examples/original_html/Module 4: Quiz: For all, there exists type proofs: MAT 243: Discrete Math Structures (2019 Fall) - o.html"]
    html_paths = get_HTML_paths_from_directory(
        "/Users/zak/dev/canvas-to-quizlet/examples/original_html")

    path = "/Users/zak/dev/canvas-to-quizlet/examples/full-size-output.txt"
    if os.path.exists(path):
        os.remove(path)

    # performance_test(do_run, [html_paths, output_path], repetitions=100, print_times=False)
    do_run(html_paths, output_path=path)

    if set_view_results:
        print("File Count: ", len(html_paths))
        view_run_results()


def do_run(html_paths, output_path=None):
    global failure
    for i, f in enumerate(html_paths):
        if log:
            print("\n\n", f[55:100])
        file = open(f, "r", encoding="utf8")
        content = file.read()
        file.close()
        pairs = get_pairs(content)
        if not pairs:
            failure += 1
            if log:
                print("Write Failed!")
            continue
        if not write_to_single_file or not output_path:
            output_path = get_output_path(f)
        write_pairs(pairs, output_path)
        if log:
            print(f'File {i+1} : Wrote to {output_path}.')


def view_run_results():
    print("\nRun Results:")
    print("   Questions Seen:", q_seen)
    print("   Questions Written", q_written)
    if q_seen != q_written:
        print("DISCREPANCY FOUND with QUESTIONS! A DIFFERENCE OF",
              abs(q_seen, q_written))

    print("   Answers Seen:", a_seen)
    print("   Answers Written", a_written)
    if a_seen != a_written:
        print("DISCREPANCY FOUND with ANSWERS! A DIFFERENCE OF",
              abs(a_seen-a_written))
    print("   Failures:", failure)


if __name__ == "__main__":
    main()
