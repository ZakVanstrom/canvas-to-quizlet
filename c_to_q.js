// Global Variables for Reporting
var q_seen = 0
var a_seen = 0
var q_written = 0
var a_written = 0
var failure = 0

// Options
var log = false
var adv_log = false
var set_view_results = true
var write_to_single_file = true

class PerformanceTester {
    test(func, args, repetitions=10, arg_list=null, this_name=null) {
        function now() {return Date.now()}
        let times = []
        let t0 = now()
        for (i in range(repetitions)) {
            let t = now()
            if (arg_list != null) {
                args = arg_list[i]
            }
            if (typeof args === list) {
                func(...args)
            } 
            else { 
                func(args)
                times.append(now()-t)
            }
        }
        let t1 = now()

        let stats = {}
        stats['total'] = t1-t0
        stats['average'] = sum(times)/len(times)
        stats['low'] = min(times)
        stats['high'] = max(times)
        stats['range'] = stats['high'] - stats['low']

        for (var k in stats) {
            stats[k] = stats[k].toFixed(2)
        }

        var time_strings = {}
        for (var s in times) {
            time_strings[s] = times[s].toFixed(2)
        }

        if (this_name === null) {
            console.log("Run Finished!")
        }
        else {
            console.log(`${this_name}: Run Finished`)
        }

        if (console.log_times) {
            console.log(`\tTimes (s): ${', '.join(time_strings)}`)
        }

        console.log(`\tTotal Run Time: ${stats['total']} seconds.`)
        console.log(`\tAverage was ${stats['average']} seconds.`)
        console.log(`\tFastest Run was ${stats['low']} seconds`)
        console.log(`\tSlowest was ${stats['high']}.`)
        console.log(`\tRange of ${stats['range']} seconds.`)
    }
}

class CanvasToQuizletConverter {
    get_pairs(file) {
        scrape = bs(file, features="html.parser")
        all_questions = scrape.select('div.text')
        pairs = []
        if (log) {
            console.log("Question Count: " + str(len(all_questions)))
        }
        for (q in all_questions) {
            q_seen += 1
            question_text = clean_up(
                q.find('div', class_='question_text user_content').text)
            answers = q.findAll('div', class_=["answer_for_"])
            answer_texts = []
            for (a in answers) {
                answer_string = str(a['title'])
                if (!answer_string.includes("correct answer")) {
                    continue
                }
                a_seen += 1
                cor_ans = ". The correct answer was "
                i = answer_string.find(cor_ans)
                if (i >= 0) {
                    i1 = answer_string.find(" You selected ")
                    part1 = clean_up(answer_string.substring(0, i1))
                    part2 = clean_up(answer_string.substring(i+cor_ans.len))
                    answer_string = part1 + " --> " + part2
                }
                answer_texts.append(clean_up(answer_string, 'answer'))
                pairs.append([question_text, answer_texts])
                if (log) {
                    console.log("// Answers: " + str(len(answers)))
                    if (adv_log) {
                        console.log('\n\t'.join(answer_texts))
                    }
                }
            }
        }
        return pairs
    }

    clean_up(txt, object_type='') {
        txt = txt.replace('\n', '  ').replace(';', '.').replace('\t', ' ');
        if (object_type == 'answer') {
            txt = txt.replace(". This was the correct answer.", '')
            txt = txt.replace(". You selected this answer", '')
            txt = txt.replace(". You selected ", " --> ")
        }
        return txt.strip()
    }

    write_pairs(pairs, document) {
        for (pair in pairs) {
            a_written += len(pair[1])
            q_written += 1
            answer_as_text = '\n\n'.join(pair[1])
            var a = document.createElement(`${pair[0]}\t${answer_as_text};`)
        }
        a.href = window.URL.createObjectURL(new Blob(["CONTENT"], {type: "text/plain"}));
        a.download = "demo.txt";
        a.click();
    }

    main(){
        // performance_test(do_run, [html_paths, output_path], repetitions=100, console.log_times=False)
        do_run(html_paths, output_path=path)

        if (set_view_results) {
            console.log("File Count: ", len(html_paths))
            view_run_results()
        }
    }

    do_run(html_paths, output_path=null) {
        i = 1
        for (f in html_paths) {
            if (log) {
                console.log("\n\n", f.substring(55,100))
            }
            file = open(f, "r", encoding="utf8")
            content = file.read()
            file.close()
            pairs = get_pairs(content)
            if (!pairs) {
                failure += 1
                if (log){
                    console.log("Write Failed!")
                }
                continue
            }
            if (!(write_to_single_file && output_path)){
                output_path = get_output_path(f)
            }
            write_pairs(pairs, output_path)
            if (log) {
                console.log(`File ${i+1} : Wrote to ${output_path}.`)
            }
            f++
        }  
    }


    view_run_results() {
        console.log("\nRun Results:")
        console.log("   Questions Seen:", q_seen)
        console.log("   Questions Written", q_written)
        if (q_seen != q_written) {
            console.log("DISCREPANCY FOUND with QUESTIONS! A DIFFERENCE O",
                abs(q_seen, q_written))
        }
        console.log("   Answers Seen:", a_seen)
        console.log("   Answers Written", a_written)
        if (a_seen != a_written){
            console.log("DISCREPANCY FOUND with ANSWERS! A DIFFERENCE O",
                abs(a_seen-a_written))
        }
        console.log("   Failures:", failure)
    }
}

var tester = new PerformanceTester()
var converter = new CanvasToQuizletConverter()

converter.