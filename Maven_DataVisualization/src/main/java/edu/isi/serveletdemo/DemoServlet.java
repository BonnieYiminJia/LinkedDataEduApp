package edu.isi.serveletdemo;

import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.InputStream;
import java.io.OutputStream;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import weka.core.Instances;
import au.com.bytecode.opencsv.CSVWriter;
import edu.isi.linearRegression.ConvertCSV;
import edu.isi.linearRegression.InterprateArff;
import edu.isi.linearRegression.WekaDemo;

/**
 * Servlet implementation class DemoServlet
 */
@WebServlet("/DemoServlet")
public class DemoServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
    private static final String generateCsvLocation= "/Users/Alison/Documents/workspace/";
    private static final String trainFileLocation = "/Users/Alison/Documents/workspace/";
    private static final String testFileLocation = "/Users/Alison/Documents/workspace/";
    /**
     * @see HttpServlet#HttpServlet()
     */
    public DemoServlet() {
        super();
        // TODO Auto-generated constructor stub
    }
   

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		PrintWriter out = response.getWriter();
		out.println("hello world");
		
		Object requestObject = request.getParameter("filename");
		if(requestObject != null){
			String filename = (String)requestObject;
			String contentType=			response.getContentType();
		}
	}
		private String getContentType(String fileType){
			return null;
		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		InputStream in = request.getInputStream();
		BufferedReader br = new BufferedReader(new InputStreamReader(in));
		if(in==null)throw new IOException("Input is null");
		
		try {
			//process request			
			String features = request.getParameter("features");	
			generateCSV(generateCsvLocation,features);//"d:/etc/test1.csv"
			
			System.out.println("Already generate the CSV: HIHIHIHI");
			
			WekaDemo demo= new WekaDemo(generateCsvLocation,trainFileLocation,testFileLocation);
			/*
			 * ConvertCSV c = new ConvertCSV();
			c.convert("test1");
			InterprateArff ia = new InterprateArff("d:/etc/train1.arff","d:/etc/test1.arff");
			ia.TrainModel();
			*/
			
			System.out.println("Complete Model Analysis!");
			String ranking = demo.getRanking();
			
			//Instances pred = ia.getPredict();
			response.setContentType("text");
			PrintWriter out = response.getWriter();
			//Response with the ranking array
			out.print(ranking);		
			
			
			//response.setContentType("text/plain");	
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		finally {
			in.close();
		}
		
	}
	

	public void generateCSV(String fileName,String features) throws Exception{
			
			
			String[] arrayFeatures = features.split("\n");
			CSVWriter writer = new CSVWriter(new FileWriter(fileName),'\t');
		
			for(int i = 0; i <arrayFeatures.length; i++){
				
				String[] entries = arrayFeatures[i].split(",");
				writer.writeNext(entries);
			}
			
			writer.close();
			
			
	}
		
}
