package com.bpodgursky.nlpviz.api;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.io.*;

import com.bpodgursky.nlpviz.AbstractParser;
import com.bpodgursky.nlpviz.EnglishParser;

public class Batch implements Runnable {

    private static AbstractParser englishParser = new EnglishParser();

    String JSONName = "";

    public void run() {

        // The name of the file to open.
        String fileDir = "./batch/en";

        File dir = new File(fileDir);
        File[] files = dir.listFiles();

        ArrayList<String> listFiles = new ArrayList<>();
        listFiles.add("node");
        listFiles.add("./src/main/www/com/bpodgursky/nlpviz/www/resources/d3Ex.js");

        // This will reference one line at a time
        String line = null;

        // Append every line
        StringBuilder sb = new StringBuilder();

        for (File file : files) {
            if (file.getName().contains(".txt")) {
                try {
                    // FileReader reads text files in the default encoding.
                    FileReader fileReader = new FileReader(file);

                    // Always wrap FileReader in BufferedReader.
                    BufferedReader bufferedReader = new BufferedReader(fileReader);

                    while ((line = bufferedReader.readLine()) != null) {
                        // System.out.println(line);
                        sb.append(line);
                    }

                    String[] everything = sb.toString().split("(?<=;)|(?<=\\.)");

                    String JSON = "";
                    for (int i = 0; i < everything.length; i++) {
                        try {
                            JSON = englishParser.parse(everything[i]).toString();
                        } catch (Exception e) {
                            // TODO Auto-generated catch block
                            e.printStackTrace();
                        }
                        JSONName = stripExtension(file.getName()) + "-" + String.format("%03d", i + 1) + ".json";
                        listFiles.add(stripExtension(JSONName));
                        listFiles.add(everything[i]);
                        // System.out.println(file.getParent() +"\\"+ JSONName);
                        PrintWriter jsonFile = new PrintWriter(file.getParent() + "/" + JSONName, "UTF-8");
                        jsonFile.write(JSON);
                        jsonFile.close();
                        Process process = new ProcessBuilder(listFiles).start();
                        System.out.println("Node is running ...");
                        process.waitFor();

                        for (int j = listFiles.size() - 1; j >= 2; j--) {
                            listFiles.remove(j);
                        }

                    }

                    sb.setLength(0);
                    // Always close files.
                    bufferedReader.close();
                    // Process process = new ProcessBuilder(listFiles).start();

                    // InputStream is = process.getInputStream();
                    // InputStreamReader isr = new InputStreamReader(is);
                    // BufferedReader br = new BufferedReader(isr);
                    // String tmp;
                    // System.out.println(listFiles);

                    // while ((tmp = br.readLine()) != null) {
                    // System.out.println(tmp);
                    // }

                } catch (IOException ex) {
                    System.out.println("Error reading file '" + fileDir + "'");
                } catch (InterruptedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            }
        }
        // System.exit(0);
    }

    static String stripExtension(String str) {
        // Handle null case specially.

        // Get position of last '.'.

        int pos = str.lastIndexOf(".");

        // If there wasn't any '.' just return the string as is.

        if (pos == -1)
            return str;

        // Otherwise return the string, up to the dot.

        return str.substring(0, pos);
    }

    public static void main(String[] args) throws InterruptedException {
        Batch batch = new Batch();
        Thread thread = new Thread(batch);

        thread.start();
    }
}
